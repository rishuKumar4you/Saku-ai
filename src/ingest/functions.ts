import {ExecutionStatus} from '@/generated/prisma';
import prisma from '@/lib/db';
import {createAnthropic} from '@ai-sdk/anthropic';
import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {generateText} from 'ai';
import {google as googleapis} from 'googleapis';

import {inngest} from './client';

const googleAI = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

// Original AI execution function (keeping for backward compatibility)
export const execute = inngest.createFunction(
    {id: 'execute-ai'},
    {event: 'execute/ai'},

    async ({event, step}) => {
      await step.sleep('pretend', '5s')
      const {
        steps: geminiSteps
      } = await step.ai.wrap('gemini-generate-text', generateText, {
        system:
            'You are a helpful assistant that generates text based on user prompts.',
        prompt: 'what is 2+2?',
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
        model: googleAI('gemini-2.5-flash'),
      });

      const {
        steps: openaiSteps
      } = await step.ai.wrap('openai-generate-text', generateText, {
        system:
            'You are a helpful assistant that generates text based on user prompts.',
        prompt: 'what is 2+2?',
        model: openai('gpt-4o'),
      });

      const {
        steps: anthropicSteps
      } = await step.ai.wrap('anthropic-generate-text', generateText, {
        system:
            'You are a helpful assistant that generates text based on user prompts.',
        prompt: 'what is 2+2?',
        model: anthropic('claude-sonnet-4-5'),
      });

      return {
        geminiSteps, openaiSteps, anthropicSteps,
      }
    },
);

// New workflow execution function
export const executeWorkflow = inngest.createFunction(
    {id: 'execute-workflow', cancelOn: [{event: 'workflow/cancel'}]},
    {event: 'workflow/execute'},

    async ({event, step}) => {
      const {executionId, workflowId, userId, triggerData} = event.data;

      console.log(
          'Starting workflow execution:', {executionId, workflowId, userId});

      // Update execution status to RUNNING
      await step.run('update-execution-status', async () => {
        console.log('Updating execution status to RUNNING');
        return prisma.execution.update({
          where: {id: executionId},
          data: {
            status: ExecutionStatus.RUNNING,
            updatedAt: new Date(),
          },
        });
      });

      try {
        // Get workflow with nodes and connections
        const workflow = await step.run('get-workflow', async () => {
          return prisma.workflow.findFirst({
            where: {id: workflowId},
            include: {
              nodes: true,
              connections: true,
            },
          });
        });

        if (!workflow) {
          throw new Error('Workflow not found');
        }

        // Get user credentials
        const credentials = await step.run('get-credentials', async () => {
          return prisma.credential.findMany({
            where: {
              userId,
              isActive: true,
            },
          });
        });

        // Build execution graph and execute nodes in a single step
        // (Maps don't serialize well across Inngest steps)
        const results = await step.run('execute-workflow', async () => {
          const graph =
              buildExecutionGraph(workflow.nodes, workflow.connections);
          console.log('Built execution graph');
          return executeWorkflowNodes(graph, credentials, triggerData);
        });

        // Update execution with results
        await step.run('update-execution-complete', async () => {
          return prisma.execution.update({
            where: {id: executionId},
            data: {
              status: ExecutionStatus.COMPLETED,
              result: results,
              completedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        });

        return {success: true, results};

      } catch (error) {
        // Update execution with error
        await step.run('update-execution-error', async () => {
          return prisma.execution.update({
            where: {id: executionId},
            data: {
              status: ExecutionStatus.FAILED,
              error: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        });

        throw error;
      }
    },
);

// Helper function to build execution graph
function buildExecutionGraph(
    nodes: any[], connections: any[]): Map<string, any> {
  const graph = new Map<string, any>();

  // Initialize nodes
  nodes.forEach(node => {
    graph.set(node.id, {
      node,
      dependencies: [],
      dependents: [],
    });
  });

  // Build connections
  connections.forEach(connection => {
    const source = graph.get(connection.fromNodeId);
    const target = graph.get(connection.toNodeId);

    if (source && target) {
      source.dependents.push(target.node.id);
      target.dependencies.push(source.node.id);
    }
  });

  return graph;
}

// Helper function to execute workflow nodes
async function executeWorkflowNodes(
    graph: Map<string, any>, credentials: any[], triggerData?: any) {
  const results = new Map();
  const executed = new Set();
  const credentialMap = new Map();

  // Build credential map
  credentials.forEach(cred => {
    credentialMap.set(cred.type, cred);
  });

  // Find trigger nodes (nodes with no dependencies)
  const triggerNodes =
      Array.from(graph.values()).filter(node => node.dependencies.length === 0);

  // If triggerData is provided, inject it into the first trigger node result
  if (triggerData && triggerNodes.length > 0) {
    const firstTriggerNode = triggerNodes[0];
    results.set(firstTriggerNode.node.id, {
      type: 'trigger',
      status: 'completed',
      data: triggerData,
    });
    executed.add(firstTriggerNode.node.id);

    // Add dependents of the first trigger to queue
    const queue: any[] = [];
    firstTriggerNode.dependents.forEach((depId: string) => {
      const dependent = graph.get(depId);
      if (dependent && !executed.has(depId)) {
        queue.push(dependent);
      }
    });

    // Execute remaining nodes
    while (queue.length > 0) {
      const current = queue.shift();

      if (executed.has(current.node.id)) {
        continue;
      }

      // Check if all dependencies are executed
      const allDepsExecuted =
          current.dependencies.every((depId: string) => executed.has(depId));
      if (!allDepsExecuted) {
        continue;
      }

      // Execute the node
      const result = await executeNode(current.node, results, credentialMap);
      results.set(current.node.id, result);
      executed.add(current.node.id);

      // Add dependents to queue
      current.dependents.forEach((depId: string) => {
        const dependent = graph.get(depId);
        if (dependent && !executed.has(depId)) {
          queue.push(dependent);
        }
      });
    }
  } else {
    // Execute nodes in topological order (normal flow without trigger data)
    const queue = [...triggerNodes];

    while (queue.length > 0) {
      const current = queue.shift();

      if (executed.has(current.node.id)) {
        continue;
      }

      // Check if all dependencies are executed
      const allDepsExecuted =
          current.dependencies.every((depId: string) => executed.has(depId));
      if (!allDepsExecuted) {
        continue;
      }

      // Execute the node
      const result = await executeNode(current.node, results, credentialMap);
      results.set(current.node.id, result);
      executed.add(current.node.id);

      // Add dependents to queue
      current.dependents.forEach((depId: string) => {
        const dependent = graph.get(depId);
        if (dependent && !executed.has(depId)) {
          queue.push(dependent);
        }
      });
    }
  }

  return Object.fromEntries(results);
}

// Helper function to execute a single node
async function executeNode(
    node: any, previousResults: Map<string, any>,
    credentials: Map<string, any>) {
  const nodeData = node.data || {};

  switch (node.type) {
    case 'MANUAL_TRIGGER':
      return {
        type: 'trigger',
        status: 'completed',
        data: {message: 'Manual trigger activated'},
      };

    case 'EMAIL_TRIGGER':
      return await executeEmailTriggerNode(
          nodeData, credentials.get('GMAIL_OAUTH'));

    case 'SCHEDULE_TRIGGER':
      return {
        type: 'trigger',
        status: 'completed',
        data: {
          message: 'Schedule trigger activated',
          content: `Scheduled trigger executed at ${new Date().toISOString()}`,
          schedule: nodeData.schedule,
          enabled: nodeData.enabled,
        },
      };

    case 'AI_OPENAI':
      return await executeAINode(
          nodeData, 'openai', credentials.get('OPENAI_API_KEY'),
          previousResults);

    case 'AI_GEMINI':
      return await executeAINode(
          nodeData, 'gemini', credentials.get('GEMINI_API_KEY'),
          previousResults);

    case 'AI_ANTHROPIC':
      return await executeAINode(
          nodeData, 'anthropic', credentials.get('ANTHROPIC_API_KEY'),
          previousResults);

    case 'EMAIL':
      return await executeEmailNode(
          nodeData, credentials.get('GMAIL_OAUTH'), previousResults);

    case 'HTTP_REQUEST':
      return await executeHttpRequestNode(nodeData);

    default:
      return {
        type: 'unknown',
        status: 'skipped',
        data: {message: `Unknown node type: ${node.type}`},
      };
  }
}

// Helper function to execute AI nodes
async function executeAINode(
    nodeData: any, provider: string, credential: any,
    previousResults: Map<string, any>) {
  if (!credential || !credential.apiKey) {
    throw new Error(`Missing ${provider} API key`);
  }

  try {
    // Configure the AI client with the API key from database
    let model;
    if (provider === 'openai') {
      const openaiClient = createOpenAI({
        apiKey: credential.apiKey,
      });
      model = openaiClient(nodeData.model);
    } else if (provider === 'gemini') {
      const googleClient = createGoogleGenerativeAI({
        apiKey: credential.apiKey,
      });
      model = googleClient(nodeData.model);
    } else if (provider === 'anthropic') {
      const anthropicClient = createAnthropic({
        apiKey: credential.apiKey,
      });
      model = anthropicClient(nodeData.model);
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    // Process prompt with template variables
    let processedPrompt = nodeData.prompt || 'Hello, how are you?';
    processedPrompt =
        replaceTemplateVariables(processedPrompt, previousResults);

    console.log('Original prompt:', nodeData.prompt);
    console.log('Processed prompt:', processedPrompt);

    const startTime = Date.now();

    // Generate text using the AI SDK
    const result = await generateText({
      model,
      prompt: processedPrompt,
      temperature: nodeData.temperature || 0.7,
    });

    const processingTime = Date.now() - startTime;

    return {
      type: 'ai',
      provider,
      status: 'completed',
      data: {
        content: result.text,
        model: nodeData.model || 'default',
        function: nodeData.function || 'text_generation',
        metadata: {
          processingTime,
          tokensUsed: result.usage?.totalTokens,
        },
      },
    };
  } catch (error) {
    console.error(`AI execution error for ${provider}:`, error);
    throw new Error(`AI execution failed: ${
        error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to replace template variables with actual data
function replaceTemplateVariables(
    content: string, previousResults: Map<string, any>): string {
  if (!content || !previousResults) {
    return content;
  }

  console.log('Replacing template variables in:', content);
  console.log(
      'Available previous results:', Array.from(previousResults.keys()));

  // Replace variables like {{nodeId.field}} with actual data
  return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    // Trim whitespace from the variable string
    const trimmedVariable = variable.trim();
    const [nodeId, field] = trimmedVariable.split('.');

    console.log(`Looking for nodeId: "${nodeId}", field: "${
        field}" (original: "${variable}")`);

    // Validate that we have both nodeId and field
    if (!nodeId || !field) {
      console.warn(`Invalid template variable format: ${
          match}. Expected format: {{nodeId.field}}`);
      return match;
    }

    if (previousResults.has(nodeId)) {
      const nodeResult = previousResults.get(nodeId);
      console.log(`Found node result for ${nodeId}:`, nodeResult);

      const hasData = nodeResult && nodeResult.data;
      const fieldValue = hasData ? nodeResult.data[field] : undefined;

      console.log(`  - hasData: ${hasData}`);
      console.log(`  - fieldValue: ${fieldValue}`);

      if (fieldValue !== undefined && fieldValue !== null) {
        const replacement = String(fieldValue);
        console.log(`Replacing ${match} with:`, replacement);
        return replacement;
      } else if (hasData) {
        console.log(
            `Field "${field}" not found in data. Available fields:`,
            Object.keys(nodeResult.data));
      }
    } else {
      console.warn(
          `Node "${nodeId}" not found in previous results. Available nodes:`,
          Array.from(previousResults.keys()));
    }

    // If variable not found, return the original match
    console.log(`Variable ${match} not found, keeping original`);
    return match;
  });
}

// Helper function to execute email nodes
async function executeEmailNode(
    nodeData: any, credential: any, previousResults: Map<string, any>) {
  if (!credential || !credential.accessToken) {
    throw new Error('Missing Gmail OAuth token');
  }

  try {
    console.log('Executing email node:', {
      to: nodeData.receiverEmail,
      subject: nodeData.subject,
    });

    // Create Gmail API client with OAuth2
    const oauth2Client = new googleapis.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET,
        process.env.BETTER_AUTH_URL + '/api/auth/gmail/callback');

    // Set the credentials
    oauth2Client.setCredentials({
      access_token: credential.accessToken,
      refresh_token: credential.refreshToken,
    });

    const gmail = googleapis.gmail({version: 'v1', auth: oauth2Client});

    // Get the authenticated user's email address
    const profile = await gmail.users.getProfile({userId: 'me'});
    const senderEmail = profile.data.emailAddress;

    if (!senderEmail) {
      throw new Error('Could not get authenticated user email address');
    }

    // Process email content with template variables
    let emailContent = nodeData.content || 'No content provided';
    let subject = nodeData.subject || 'No subject';

    // Replace template variables with data from previous nodes
    if (nodeData.useTemplate && nodeData.template) {
      emailContent = nodeData.template;
    }

    // Replace template variables like {{previousNode.content}} with actual data
    emailContent = replaceTemplateVariables(emailContent, previousResults);
    subject = replaceTemplateVariables(subject, previousResults);

    const to = nodeData.receiverEmail;

    // Create the email message in RFC 2822 format
    const message = [
      `From: ${senderEmail}`, `To: ${to}`, `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8', '', emailContent
    ].join('\n');

    // Encode the message in base64url format
    const encodedMessage = Buffer.from(message)
                               .toString('base64')
                               .replace(/\+/g, '-')
                               .replace(/\//g, '_')
                               .replace(/=+$/, '');

    // Send the email
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('Email sent successfully:', result.data);

    return {
      type: 'email',
      status: 'completed',
      data: {
        to: nodeData.receiverEmail,
        from: senderEmail,
        subject: nodeData.subject,
        messageId: result.data.id,
        message: 'Email sent successfully via Gmail API',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Email execution error:', error);
    throw new Error(`Email execution failed: ${
        error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to execute HTTP request nodes
async function executeHttpRequestNode(nodeData: any) {
  // This is a simplified implementation
  // In a real implementation, you would make the actual HTTP request
  return {
    type: 'http',
    status: 'completed',
    data: {
      url: nodeData.url || 'https://example.com',
      method: nodeData.method || 'GET',
      response: 'HTTP request completed',
    },
  };
}

// Helper function to execute email trigger nodes (for one-time execution)
async function executeEmailTriggerNode(nodeData: any, credential: any) {
  if (!credential || !credential.accessToken) {
    throw new Error('Missing Gmail OAuth token for email trigger');
  }

  try {
    console.log('Executing email trigger node:', {
      senderEmail: nodeData.senderEmail,
      subjectFilter: nodeData.subjectFilter,
      enabled: nodeData.enabled,
    });

    // Create Gmail API client with OAuth2
    const oauth2Client = new googleapis.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET,
        process.env.BETTER_AUTH_URL + '/api/auth/gmail/callback');

    // Set the credentials
    oauth2Client.setCredentials({
      access_token: credential.accessToken,
      refresh_token: credential.refreshToken,
    });

    const gmail = googleapis.gmail({version: 'v1', auth: oauth2Client});

    // Build query for Gmail API
    let query = 'is:unread';  // Only get unread emails

    if (nodeData.senderEmail) {
      query += ` from:${nodeData.senderEmail}`;
    }

    if (nodeData.subjectFilter) {
      query += ` subject:${nodeData.subjectFilter}`;
    }

    console.log('Gmail query:', query);
    console.log('Waiting for matching email...');

    // For Inngest background jobs, we can wait longer
    // Poll for emails - check every 30 seconds for up to 1 hour
    const maxAttempts = 120;     // 120 attempts * 30 seconds = 1 hour max wait
    const pollInterval = 30000;  // 30 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Checking for emails (attempt ${attempt}/${maxAttempts})...`);

      // Search for emails matching the criteria
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: 1,  // Get the most recent matching email
      });

      const messages = response.data.messages || [];

      if (messages.length === 0) {
        // No email found yet, wait before next check
        if (attempt < maxAttempts) {
          console.log(`No matching email found yet. Waiting ${
              pollInterval / 1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        } else {
          // Timeout reached
          console.log(
              'Email trigger timeout: No matching emails found after maximum wait time');
          return {
            type: 'trigger',
            status: 'completed',
            data: {
              message:
                  'No matching emails found within timeout period (1 hour)',
              triggered: false,
              query,
              maxWaitTime: '1 hour',
              timestamp: new Date().toISOString(),
            },
          };
        }
      }

      // Found a matching email!
      const messageId = messages[0].id;
      const messageDetails = await gmail.users.messages.get({
        userId: 'me',
        id: messageId!,
        format: 'full',
      });

      // Extract email details
      const headers = messageDetails.data.payload?.headers || [];
      const from =
          headers.find(h => h.name?.toLowerCase() === 'from')?.value || '';
      const subject =
          headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '';
      const date =
          headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';

      // Extract email body
      let body = '';
      if (messageDetails.data.payload?.parts) {
        // Multipart email
        const textPart = messageDetails.data.payload.parts.find(
            part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (messageDetails.data.payload?.body?.data) {
        // Simple email
        body = Buffer.from(messageDetails.data.payload.body.data, 'base64')
                   .toString('utf-8');
      }

      console.log('Email trigger activated:', {
        from,
        subject,
        messageId,
        attemptNumber: attempt,
      });

      // Mark the email as read so it doesn't trigger again
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId!,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      });

      return {
        type: 'trigger',
        status: 'completed',
        data: {
          message: 'Email trigger activated',
          triggered: true,
          email: {
            from,
            subject,
            body: body.substring(0, 500),  // Limit body length
            date,
            messageId,
          },
          content: body,  // Full content for template variables
          waitTime: `${attempt * 30} seconds`,
          timestamp: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    console.error('Email trigger execution error:', error);
    throw new Error(`Email trigger execution failed: ${
        error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Continuous email trigger function (runs indefinitely)
export const emailTriggerMonitor = inngest.createFunction(
    {id: 'email-trigger-monitor', cancelOn: [{event: 'workflow/cancel'}]},
    {event: 'workflow/email-trigger/start'},

    async ({event, step}) => {
      const {workflowId, userId, nodeId, nodeData} = event.data;

      console.log('Starting continuous email trigger monitor:', {
        workflowId,
        userId,
        nodeId,
      });

      // Get user credentials
      const credentials = await step.run('get-credentials', async () => {
        return prisma.credential.findFirst({
          where: {
            userId,
            type: 'GMAIL_OAUTH',
            isActive: true,
          },
        });
      });

      if (!credentials) {
        throw new Error('Gmail OAuth credentials not found');
      }

      // Continuously monitor for emails
      while (true) {
        try {
          // Check for matching emails
          const result =
              await step.run(`check-email-${Date.now()}`, async () => {
                return executeEmailTriggerNode(nodeData, credentials);
              });

          // If email was triggered, execute the workflow
          if (result && result.data && result.data.triggered) {
            console.log('Email trigger activated, executing workflow');

            // Create a new execution
            const execution = await step.run('create-execution', async () => {
              return prisma.execution.create({
                data: {
                  workflowId,
                  status: ExecutionStatus.PENDING,
                },
              });
            });

            // Trigger workflow execution
            await step.run('trigger-workflow', async () => {
              return inngest.send({
                name: 'workflow/execute',
                data: {
                  executionId: execution.id,
                  workflowId,
                  userId,
                  triggerData: result.data,
                },
              });
            });
          }

          // Wait before next check (5 minutes)
          await step.sleep('wait-before-next-check', '5m');

        } catch (error) {
          console.error('Error in email trigger monitor:', error);
          // Wait before retrying
          await step.sleep('wait-after-error', '1m');
        }
      }
    },
);

// Schedule trigger function (runs on a schedule)
export const scheduleTriggerMonitor = inngest.createFunction(
    {id: 'schedule-trigger-monitor', cancelOn: [{event: 'workflow/cancel'}]},
    {event: 'workflow/schedule-trigger/start'},

    async ({event, step}) => {
      const {workflowId, userId, nodeId, nodeData} = event.data;

      console.log('Starting schedule trigger monitor:', {
        workflowId,
        userId,
        nodeId,
        schedule: nodeData,
      });

      // Continuously run on schedule
      while (true) {
        try {
          console.log('Schedule trigger activated, executing workflow');

          // Create a new execution
          const execution = await step.run('create-execution', async () => {
            return prisma.execution.create({
              data: {
                workflowId,
                status: ExecutionStatus.PENDING,
              },
            });
          });

          // Trigger workflow execution
          await step.run('trigger-workflow', async () => {
            return inngest.send({
              name: 'workflow/execute',
              data: {
                executionId: execution.id,
                workflowId,
                userId,
                triggerData: {
                  message: 'Schedule trigger activated',
                  content: `Scheduled trigger executed at ${
                      new Date().toISOString()}`,
                  timestamp: new Date().toISOString(),
                },
              },
            });
          });

          // Wait based on the configured interval
          const time = nodeData.time || 1;
          const unit = nodeData.unit || 'minutes';

          let waitTime = '1m';
          if (unit === 'minutes') {
            waitTime = `${time}m`;
          } else if (unit === 'hours') {
            waitTime = `${time}h`;
          } else if (unit === 'days') {
            waitTime = `${time * 24}h`;
          }

          console.log(`Waiting ${waitTime} before next execution`);
          await step.sleep('wait-for-next-schedule', waitTime);

        } catch (error) {
          console.error('Error in schedule trigger monitor:', error);
          // Wait before retrying
          await step.sleep('wait-after-error', '1m');
        }
      }
    },
);