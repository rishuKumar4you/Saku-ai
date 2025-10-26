import {InitialNode} from '@/components/initial-node';
import {AnthropicNode} from '@/features/executions/components/ai-anthropic/node';
import {GeminiNode} from '@/features/executions/components/ai-gemini/node';
import {OpenAINode} from '@/features/executions/components/ai-openai/node';
import {EmailNode} from '@/features/executions/components/email/node';
import {HttpRequestNode} from '@/features/executions/components/http-request/node';
import {EmailTriggerNode} from '@/features/triggers/components/email-trigger/node';
import {ManualTriggerNode} from '@/features/triggers/components/manual-trigger/node';
import {ScheduleTriggerNode} from '@/features/triggers/components/schedule-trigger/node';
import {NodeType} from '@/generated/prisma';
import type {NodeTypes} from '@xyflow/react';

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.EMAIL_TRIGGER]: EmailTriggerNode,
  [NodeType.SCHEDULE_TRIGGER]: ScheduleTriggerNode,
  [NodeType.AI_OPENAI]: OpenAINode,
  [NodeType.AI_GEMINI]: GeminiNode,
  [NodeType.AI_ANTHROPIC]: AnthropicNode,
  [NodeType.EMAIL]: EmailNode,
} as const satisfies NodeTypes;


export type RegisteredNodeType = keyof typeof nodeComponents;
