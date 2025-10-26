import { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = (nodeData?.description as string) || "Triggers when the workflow is manually executed";

    return (
        <>
            <ManualTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultName={nodeData?.name as string | undefined}
                defaultDescription={nodeData?.description as string | undefined}
            />
            <BaseTriggerNode
                {...props}
                icon={MousePointerIcon}
                name={(nodeData?.name as string) || "Manual Trigger"}
                subtitle="Manual Execution"
                description="Triggers when the workflow is manually executed"
                status={nodeStatus} 
                onSettings={handleOpenSettings} 
                onDoubleClick={handleOpenSettings}
                tag="Manual"
            />
        </>
    );

    function handleSubmit(values: { name?: string; description?: string }) {
        // Update node data with form values
        // This will be handled by the parent component or workflow state
        setDialogOpen(false);
    }
});