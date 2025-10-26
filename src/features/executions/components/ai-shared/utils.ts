// Shared utilities for AI workflow nodes
import {anthropic} from '@ai-sdk/anthropic';
import {google} from '@ai-sdk/google';
import {openai} from '@ai-sdk/openai';
import {generateText} from 'ai';

import {AINodeData, AIResponse, createAIErrorResponse, createAISuccessResponse, PromptVariables, replacePromptVariables} from './types';

// AI Provider configuration
const AI_PROVIDERS = {
  openai: {
    client: openai,
    models: {
      'gpt-4o': 'gpt-4o',
      'gpt-4o-mini': 'gpt-4o-mini',
      'gpt-4-turbo': 'gpt-4-turbo',
      'gpt-3.5-turbo': 'gpt-3.5-turbo',
    }
  },
  gemini: {
    client: google,
    models: {
      'gemini-2.5-flash': 'gemini-2.5-flash',
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-1.0-pro': 'gemini-1.0-pro',
    }
  },
  anthropic: {
    client: anthropic,
    models: {
      'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022': 'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229': 'claude-3-opus-20240229',
    }
  }
} as const;

// Determine AI provider from model name
function getAIProvider(model: string): keyof typeof AI_PROVIDERS {
  if (model.startsWith('gpt-')) return 'openai';
  if (model.startsWith('gemini-')) return 'gemini';
  if (model.startsWith('claude-')) return 'anthropic';
  throw new Error(`Unknown AI model: ${model}`);
}

// Enhanced prompt for sentiment analysis
function enhancePromptForSentimentAnalysis(prompt: string): string {
  return `${prompt}

Please respond with a JSON object in the following format:
{
  "content": "Your analysis of the text",
  "sentiment": {
    "label": "positive|negative|neutral",
    "confidence": 0.95,
    "scores": {
      "positive": 0.8,
      "negative": 0.1,
      "neutral": 0.1
    }
  }
}

Make sure the response is valid JSON.`;
}

// Enhanced prompt for text generation
function enhancePromptForTextGeneration(prompt: string): string {
  return `${prompt}

Please respond with a JSON object in the following format:
{
  "content": "Your generated text here"
}

Make sure the response is valid JSON.`;
}

// Parse AI response and extract structured data
function parseAIResponse(
    response: string, aiFunction: AINodeData['function']): AIResponse['data'] {
  try {
    const parsed = JSON.parse(response);

    if (aiFunction === 'sentiment_analysis') {
      return {
        content: parsed.content || response,
        function: aiFunction,
        model: '',  // Will be set by caller
        metadata: {
          timestamp: new Date().toISOString(),
        },
        sentiment: parsed.sentiment ||
            {
              label: 'neutral', confidence: 0.5,
                  scores: {positive: 0.33, negative: 0.33, neutral: 0.34}
            }
      };
    } else {
      return {
        content: parsed.content || response,
        function: aiFunction,
        model: '',  // Will be set by caller
        metadata: {
          timestamp: new Date().toISOString(),
        }
      };
    }
  } catch {
    // If JSON parsing fails, treat as plain text
    return {
      content: response,
      function: aiFunction,
      model: '',  // Will be set by caller
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// Main function to process AI requests
export async function processAIRequest(
    nodeData: AINodeData, variables: PromptVariables,
    apiKey?: string): Promise<AIResponse> {
  try {
    const provider = getAIProvider(nodeData.model);
    const providerConfig = AI_PROVIDERS[provider];

    // Replace template variables in prompt
    const processedPrompt = replacePromptVariables(nodeData.prompt, variables);

    // Enhance prompt based on function type
    const enhancedPrompt = nodeData.function === 'sentiment_analysis' ?
        enhancePromptForSentimentAnalysis(processedPrompt) :
        enhancePromptForTextGeneration(processedPrompt);

    // Configure the AI client with API key
    let model;
    if (provider === 'openai') {
      model = openai(nodeData.model);
    } else if (provider === 'gemini') {
      model = google(nodeData.model);
    } else if (provider === 'anthropic') {
      model = anthropic(nodeData.model);
    } else {
      throw new Error(`Unknown AI provider: ${provider}`);
    }

    const startTime = Date.now();

    // Generate text using the AI SDK
    const result = await generateText({
      model,
      prompt: enhancedPrompt,
      temperature: nodeData.temperature,
    });

    const processingTime = Date.now() - startTime;

    // Parse the response
    const parsedData = parseAIResponse(result.text, nodeData.function);
    parsedData.model = nodeData.model;
    parsedData.metadata.processingTime = processingTime;
    parsedData.metadata.tokensUsed = result.usage?.totalTokens;

    return createAISuccessResponse(
        parsedData.content, parsedData.function, parsedData.model,
        parsedData.metadata, parsedData.sentiment);

  } catch (error) {
    console.error('AI processing error:', error);
    return createAIErrorResponse(
        error instanceof Error ? error.message : 'Unknown AI processing error');
  }
}

// Helper function to validate AI node configuration
export function validateAINodeData(data: Partial<AINodeData>): string[] {
  const errors: string[] = [];

  if (!data.function) {
    errors.push('AI function is required');
  }

  if (!data.prompt || data.prompt.trim().length === 0) {
    errors.push('Prompt is required');
  }

  if (!data.model) {
    errors.push('Model is required');
  }

  if (data.temperature !== undefined &&
      (data.temperature < 0 || data.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }

  if (data.maxTokens !== undefined && data.maxTokens < 1) {
    errors.push('Max tokens must be at least 1');
  }

  return errors;
}
