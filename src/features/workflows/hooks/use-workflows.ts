/**
 * Client-side hooks for workflow management
 * @packageDocumentation
 */
'use client';

/**
 * Hook to fetch all workflows using suspense
 */

import {useTRPC} from '@/trpc/client'
import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import {toast} from 'sonner'
import { useWorkflowsParams } from './use-workflows-params';
export const useSuspenceWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(trpc.workflows.getMany.queryOptions(params));
};

/**
 * Hook to create a new workflow
 */

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
      trpc.workflows.create.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Workflow "${data.name}"
                        created`);
          queryClient.invalidateQueries(
              trpc.workflows.getMany.queryOptions({}),

          );
        },
        onError: (error) => {
          toast.error(`Failed to create workflow: ${error.message}`);
        },
      }),
  );
};

/**
 * Hook to remove a workflow
 */

export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.remove.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Workflow "${data.name}" removed`);
        queryClient.invalidateQueries(trpc.workflows.getMany.queryOptions
          ({}));
        queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({
            id: data.id})
        );
      },
      onError: (error) => {
        toast.error(`Failed to remove workflow: ${error.message}`);
      },
    })
  )
}

/**
 * Hook to fetch a single workflow using suspense 
 */

export const useSuspenceWorkflow = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
};

/**
 * Hook to update a workflow name
 */

export const useUpdateWorkflowName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
      trpc.workflows.updateName.mutationOptions({
        onSuccess: (data) => {
          toast.success(`Workflow "${data.name}"
                        updated`);
          queryClient.invalidateQueries(
              trpc.workflows.getMany.queryOptions({}),              
          );
          queryClient.invalidateQueries(
            trpc.workflows.getOne.queryOptions({
              id: data.id
            }),
          );
        },
        onError: (error) => {
          toast.error(`Failed to update workflow: ${error.message}`);
        },
      }),
  );
};