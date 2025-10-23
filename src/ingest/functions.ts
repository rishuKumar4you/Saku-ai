import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {generateText} from 'ai';
import {createOpenAI} from '@ai-sdk/openai';
import {inngest} from './client';
import {createAnthropic} from '@ai-sdk/anthropic';

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();


export const execute = inngest.createFunction(
    {id: 'execute-ai'},
    {event: 'execute/ai'},

    async ({ event, step }) => {
        
        await step.sleep("pretend", "5s")
        const { steps: geminiSteps } = await step.ai.wrap('gemini-generate-text',
        generateText, 
        {
        system:
            'You are a helpful assistant that generates text based on user prompts.',
            prompt: 'what is 2+2?',
        experimental_telemetry: {
            isEnabled: true,
            recordInputs: true,     
            recordOutputs: true,
        },
        model: google('gemini-2.5-flash'),
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

        return { geminiSteps, openaiSteps, anthropicSteps, }
    },
);