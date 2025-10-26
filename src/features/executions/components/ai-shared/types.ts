// Shared types and interfaces for AI workflow nodes

export type AIFunction = 'text_generation'|'sentiment_analysis';

export type AIModel = {
  openai: 'gpt-4o'|'gpt-4o-mini'|'gpt-4-turbo'|'gpt-3.5-turbo';
  gemini: 'gemini-2.5-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash' |
      'gemini-1.0-pro';
  anthropic: 'claude-3-5-sonnet-20241022' | 'claude-3-5-haiku-20241022' |
      'claude-3-opus-20240229';
};

export interface AINodeData {
  function: AIFunction;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  [key: string]: unknown;
}

// Standardized JSON response structure for all AI nodes
export interface AIResponse {
  success: boolean;
  data: {
    content: string; function: AIFunction; model: string;
    metadata:
        {tokensUsed?: number; processingTime?: number; timestamp: string;};
    // For sentiment analysis, include structured sentiment data
    sentiment?: {
      label: 'positive' | 'negative' | 'neutral'; confidence: number;
      scores: {positive: number; negative: number; neutral: number;};
    };
  };
  error?: string;
}

// Template variables that can be used in prompts
export interface PromptVariables {
  previousNode?:
      {content: string; type: string; data?: Record<string, unknown>;};
  workflow?: {id: string; name: string;};
  user?: {id: string; name: string;};
}

// Helper function to replace template variables in prompts
export function replacePromptVariables(
    prompt: string, variables: PromptVariables): string {
  let processedPrompt = prompt;

  // Replace {{previousNode.content}}
  if (variables.previousNode?.content) {
    processedPrompt = processedPrompt.replace(
        /\{\{previousNode\.content\}\}/g, variables.previousNode.content);
  }

  // Replace {{workflow.name}}
  if (variables.workflow?.name) {
    processedPrompt = processedPrompt.replace(
        /\{\{workflow\.name\}\}/g, variables.workflow.name);
  }

  // Replace {{user.name}}
  if (variables.user?.name) {
    processedPrompt =
        processedPrompt.replace(/\{\{user\.name\}\}/g, variables.user.name);
  }

  return processedPrompt;
}

// Standardized error response
export function createAIErrorResponse(error: string): AIResponse {
  return {
    success: false,
    data: {
      content: '',
      function: 'text_generation',  // fallback
      model: '',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    },
    error,
  };
}

// Standardized success response
export function createAISuccessResponse(
    content: string, aiFunction: AIFunction, model: string,
    metadata: Partial<AIResponse['data']['metadata']> = {},
    sentiment?: AIResponse['data']['sentiment']): AIResponse {
  return {
    success: true,
    data: {
      content,
      function: aiFunction,
      model,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      ...(sentiment && {sentiment}),
    },
  };
}
