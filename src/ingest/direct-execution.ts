import {ExecutionStatus} from '@/generated/prisma';
import prisma from '@/lib/db';
import {createAnthropic} from '@ai-sdk/anthropic';
import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {generateText} from 'ai';
import {google as googleapis} from 'googleapis';

// Direct execution for development mode
export async function executeWorkflowDirectly(
    executionId: string, workflow: any, userId: string) {
  console.log(
      'Starting direct workflow execution:',
      {executionId, workflowId: workflow.id, userId});

  try {
    // Update execution status to RUNNING
    await prisma.execution.update({
      where: {id: executionId},
      data: {
        status: ExecutionStatus.RUNNING,
        updatedAt: new Date(),
      },
    });

    // Get user credentials
    const credentials = await prisma.credential.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    console.log(
        'Found credentials:',
        credentials.map(c => ({type: c.type, hasKey: !!c.apiKey})));

    // Build execution graph
    const executionGraph =
        buildExecutionGraph(workflow.nodes, workflow.connections);
    console.log('Built execution graph with', executionGraph.size, 'nodes');

    // Execute workflow nodes
    const results = await executeWorkflowNodes(executionGraph, credentials);
    console.log(
        'Workflow execution completed with results:', Object.keys(results));

    // Update execution with results
    await prisma.execution.update({
      where: {id: executionId},
      data: {
        status: ExecutionStatus.COMPLETED,
        result: results,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Execution completed successfully');
    return {success: true, results};

  } catch (error) {
    console.error('Workflow execution error:', error);

    // Update execution with error
    await prisma.execution.update({
      where: {id: executionId},
      data: {
        status: ExecutionStatus.FAILED,
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    throw error;
  }
}

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
    graph: Map<string, any>, credentials: any[]) {
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
  console.log('Found trigger nodes:', triggerNodes.map(n => n.node.type));

  // Execute nodes in topological order
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

    console.log('Executing node:', current.node.type, current.node.id);

    // Execute the node
    const result = await executeNode(current.node, results, credentialMap);
    results.set(current.node.id, result);
    executed.add(current.node.id);

    console.log(
        'Node execution result:',
        {type: current.node.type, status: result?.status});

    // Add dependents to queue
    current.dependents.forEach((depId: string) => {
      const dependent = graph.get(depId);
      if (dependent && !executed.has(depId)) {
        queue.push(dependent);
      }
    });
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

    case 'SCHEDULE_TRIGGER':
      return {
        type: 'trigger',
        status: 'completed',
        data: {message: 'Schedule trigger activated'},
      };

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
    console.log(`Executing ${provider} AI node with model:`, nodeData.model);

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

    console.log(`AI execution completed in ${processingTime}ms`);

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

  // Replace variables like {{nodeId.field}} with actual data
  return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    // Trim whitespace from the variable
    const trimmedVariable = variable.trim();
    const [nodeId, field] = trimmedVariable.split('.');

    if (!nodeId || !field) {
      console.warn('Invalid template variable format:', variable);
      return match;
    }

    const trimmedNodeId = nodeId.trim();
    const trimmedField = field.trim();

    if (previousResults.has(trimmedNodeId)) {
      const nodeResult = previousResults.get(trimmedNodeId);
      console.log('Template variable lookup:', {
        nodeId: trimmedNodeId,
        field: trimmedField,
        nodeResult,
        hasData: !!nodeResult?.data,
        fieldValue: nodeResult?.data?.[trimmedField]
      });

      if (nodeResult && nodeResult.data &&
          nodeResult.data[trimmedField] !== undefined) {
        return String(nodeResult.data[trimmedField]);
      }
    } else {
      console.warn('Node ID not found in previous results:', {
        searchingFor: trimmedNodeId,
        availableNodes: Array.from(previousResults.keys())
      });
    }

    // If variable not found, return the original match
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
  try {
    console.log('Executing HTTP request node:', nodeData.url);

    // This is a simplified implementation
    // In a real implementation, you would make the actual HTTP request
    return {
      type: 'http',
      status: 'completed',
      data: {
        url: nodeData.url || 'https://example.com',
        method: nodeData.method || 'GET',
        response: 'HTTP request completed (simulated)',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('HTTP request execution error:', error);
    throw new Error(`HTTP request execution failed: ${
        error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to execute email trigger nodes
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
    console.log('Waiting for matching email... (checking every 10 seconds)');

    // Poll for emails - check every 10 seconds for up to 5 minutes
    const maxAttempts = 30;  // 30 attempts * 10 seconds = 5 minutes max wait
    const pollInterval = 10000;  // 10 seconds

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
                  'No matching emails found within timeout period (5 minutes)',
              triggered: false,
              query,
              maxWaitTime: '5 minutes',
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
          waitTime: `${attempt * 10} seconds`,
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
