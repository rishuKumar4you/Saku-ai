"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenceWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
    return <LoadingView message="Loading editor..." />
};

export const EditorError = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
            <ErrorView message="Workflow not found"/>
            <p className="text-sm text-muted-foreground">The workflow you're looking for doesn't exist or you don't have access to it.</p>
            <a href="/workflows" className="text-primary hover:underline">← Back to Workflows</a>
        </div>
    )
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
    const { data: workflow } = useSuspenceWorkflow(workflowId);

    return (
        <p>
            {JSON.stringify(workflow, null, 2)}
        </p>
    );

 };