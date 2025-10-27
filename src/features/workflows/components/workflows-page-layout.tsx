"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useCreateWorkflow } from "../hooks/use-workflows";
import { useRouter } from "next/navigation";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { WorkflowCard } from "./workflow-card";
import { useSuspenceWorkflows } from "../hooks/use-workflows";
import { WorkflowsSearch } from "./workflows";
import { EntityPagination } from "@/components/entity-components";
import { useWorkflowsParams } from "../hooks/use-workflows-params";

export const WorkflowsPageLayout = () => {
  const workflows = useSuspenceWorkflows();
  const [params, setParams] = useWorkflowsParams();
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();
  const { handleError, modal } = useUpgradeModal();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onSuccess: (data) => {
        setTimeout(() => {
          router.push(`/workflows/${data.id}`);
        }, 100);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
                <p className="text-gray-600 mt-2">
                  Create workflow for making your work smoother
                </p>
              </div>
              <Button
                onClick={handleCreate}
                disabled={createWorkflow.isPending}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create New Workflow
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <WorkflowsSearch />
          </div>

          {/* Workflow Cards Grid or Empty State */}
          {workflows.data.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {workflows.data.items.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <PlusIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No workflows yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first workflow to automate tasks and streamline your work process.
              </p>
              <Button
                onClick={handleCreate}
                disabled={createWorkflow.isPending}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Workflow
              </Button>
            </div>
          )}

          {/* Pagination - Only show when there are workflows */}
          {workflows.data.items.length > 0 && (
            <div className="flex justify-center mt-8">
              <EntityPagination
                disabled={workflows.isFetching}
                totalPages={workflows.data.totalPages}
                page={workflows.data.page}
                onPageChange={(page) => setParams({ ...params, page })}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
