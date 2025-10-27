"use client";

import { Button } from '@/components/ui/button';
import { PlayIcon, StopCircleIcon, LoaderIcon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { editorAtom } from '../store/atoms';
import { useState, useEffect } from 'react';

interface TriggerManagerButtonProps {
  workflowId: string;
}

export const TriggerManagerButton = ({ workflowId }: TriggerManagerButtonProps) => {
  const editor = useAtomValue(editorAtom);
  const queryClient = useQueryClient();
  const [activeTriggers, setActiveTriggers] = useState<Map<string, string>>(new Map());

  // Find trigger nodes in the workflow
  const getTriggerNodes = () => {
    if (!editor) return [];
    const nodes = editor.getNodes();
    return nodes.filter(node => 
      node.type === 'EMAIL_TRIGGER' || node.type === 'SCHEDULE_TRIGGER'
    );
  };

  const triggerNodes = getTriggerNodes();
  const hasTriggers = triggerNodes.length > 0;

  // Check for active triggers
  useEffect(() => {
    const checkActiveTriggers = async () => {
      // This would ideally be a tRPC query, but for now we'll manage state locally
      // You can add a tRPC endpoint to fetch active triggers for a workflow
    };
    
    if (hasTriggers) {
      checkActiveTriggers();
    }
  }, [hasTriggers, workflowId]);

  const startTriggerMutation = useMutation({
    mutationFn: async ({ nodeId, nodeType, nodeData }: { nodeId: string; nodeType: string; nodeData: any }) => {
      const response = await fetch('/api/triggers/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId,
          nodeId,
          nodeType,
          nodeData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start trigger');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`${variables.nodeType} monitor started successfully!`);
      setActiveTriggers(prev => new Map(prev).set(variables.nodeId, data.triggerId));
    },
    onError: (error: any) => {
      toast.error(`Failed to start trigger: ${error.message}`);
    },
  });

  const stopTriggerMutation = useMutation({
    mutationFn: async ({ triggerId, nodeId }: { triggerId: string; nodeId: string }) => {
      const response = await fetch('/api/triggers/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to stop trigger');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success('Trigger monitor stopped successfully!');
      setActiveTriggers(prev => {
        const newMap = new Map(prev);
        newMap.delete(variables.nodeId);
        return newMap;
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to stop trigger: ${error.message}`);
    },
  });

  const handleStartAllTriggers = async () => {
    if (!editor) {
      toast.error('Editor not available');
      return;
    }

    const triggerNodes = getTriggerNodes();
    
    if (triggerNodes.length === 0) {
      toast.error('No trigger nodes found in workflow');
      return;
    }

    // Start all triggers
    for (const node of triggerNodes) {
      await startTriggerMutation.mutateAsync({
        nodeId: node.id,
        nodeType: node.type!,
        nodeData: node.data,
      });
    }
  };

  const handleStopAllTriggers = async () => {
    // Stop all active triggers
    const promises = Array.from(activeTriggers.entries()).map(([nodeId, triggerId]) =>
      stopTriggerMutation.mutateAsync({ triggerId, nodeId })
    );

    await Promise.all(promises);
  };

  if (!hasTriggers) {
    return null;
  }

  const hasActiveTriggers = activeTriggers.size > 0;
  const isLoading = startTriggerMutation.isPending || stopTriggerMutation.isPending;

  return (
    <div className="flex items-center gap-2">
      {!hasActiveTriggers ? (
        <Button
          onClick={handleStartAllTriggers}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <PlayIcon className="h-4 w-4" />
          )}
          Start Continuous Monitoring
        </Button>
      ) : (
        <Button
          onClick={handleStopAllTriggers}
          disabled={isLoading}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <LoaderIcon className="h-4 w-4 animate-spin" />
          ) : (
            <StopCircleIcon className="h-4 w-4" />
          )}
          Stop Monitoring ({activeTriggers.size} active)
        </Button>
      )}
    </div>
  );
};

