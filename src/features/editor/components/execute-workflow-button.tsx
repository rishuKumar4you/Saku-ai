"use client";

import { Button } from '@/components/ui/button';
import { PlayIcon, LoaderIcon } from 'lucide-react';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { editorAtom } from '../store/atoms';

interface ExecuteWorkflowButtonProps {
  workflowId: string;
}

export const ExecuteWorkflowButton = ({ workflowId }: ExecuteWorkflowButtonProps) => {
  const editor = useAtomValue(editorAtom);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
    <Button 
      size="sm" 
      onClick={handleExecute} 
      disabled={startExecutionMutation.isPending}
      className="bg-green-600 hover:bg-green-700"
    >
      {startExecutionMutation.isPending ? (
        <LoaderIcon className="size-4 animate-spin" />
      ) : (
        <PlayIcon className="size-4" />
      )}
      Execute
    </Button>
  );
};
