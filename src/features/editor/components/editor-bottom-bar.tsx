"use client";

import { Button } from '@/components/ui/button';
import { SaveIcon, SettingsIcon, PlayIcon, LoaderIcon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { editorAtom } from '../store/atoms';
import { useUpdateWorkflow } from '@/features/workflows/hooks/use-workflows';
import { useMemo } from 'react';

interface EditorBottomBarProps {
  workflowId: string;
}

export const EditorBottomBar = ({ workflowId }: EditorBottomBarProps) => {
  const editor = useAtomValue(editorAtom);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const saveWorkflow = useUpdateWorkflow();

  // Fetch executions for this workflow
  const { data: executions } = useQuery(trpc.executions.getByWorkflow.queryOptions({ workflowId }));

  // Get the last execution time
  const lastExecutionTime = useMemo(() => {
    if (!executions || executions.length === 0) {
      return null;
    }
    return executions[0]?.createdAt;
  }, [executions]);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const startExecutionMutation = useMutation(
    trpc.executions.start.mutationOptions({
      onSuccess: (execution) => {
        toast.success('Workflow execution started!');
        queryClient.invalidateQueries(trpc.executions.getByWorkflow.queryOptions({ workflowId }));
        queryClient.invalidateQueries(trpc.executions.getAll.queryOptions());
      },
      onError: (error: any) => {
        toast.error(`Failed to start workflow: ${error.message}`);
      },
    })
  );

  const handleSave = () => {
    if (!editor) {
      return;
    }

    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    // Transform nodes to match the expected type
    const transformedNodes = nodes.map(node => ({
      id: node.id,
      type: node.type || 'UNKNOWN',
      position: node.position,
      data: node.data || {},
    }));

    saveWorkflow.mutate({
      id: workflowId,
      nodes: transformedNodes,
      edges,
    });
  };

  const handleExecute = () => {
    if (!editor) {
      toast.error('Editor not available');
      return;
    }

    const nodes = editor.getNodes();
    const edges = editor.getEdges();

    // Check if workflow is saved (has nodes with data)
    const hasConfiguredNodes = nodes.some(node => 
      node.data && Object.keys(node.data).length > 0
    );

    if (!hasConfiguredNodes) {
      toast.error('Please configure and save the workflow before executing');
      return;
    }

    startExecutionMutation.mutate({ workflowId });
  };


  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className={`w-2 h-2 rounded-full ${lastExecutionTime ? 'bg-green-500' : 'bg-gray-400'}`}></div>
        <span>
          {lastExecutionTime 
            ? `Last executed ${formatTimeAgo(lastExecutionTime)}`
            : 'Never executed'
          }
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saveWorkflow.isPending}
          variant="outline"
          className="flex items-center gap-2"
        >
          <SaveIcon className="w-4 h-4" />
          Save
        </Button>
        
        <Button
          size="sm"
          onClick={handleExecute}
          disabled={startExecutionMutation.isPending}
          className="bg-black hover:bg-gray-800 text-white flex items-center gap-2"
        >
          {startExecutionMutation.isPending ? (
            <LoaderIcon className="w-4 h-4 animate-spin" />
          ) : (
            <SettingsIcon className="w-4 h-4" />
          )}
          Execute
        </Button>
      </div>
    </div>
  );
};
