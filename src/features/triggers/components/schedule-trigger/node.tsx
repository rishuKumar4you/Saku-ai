"use client";

import { NodeProps } from "@xyflow/react";
import { ClockIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { ScheduleTriggerDialog } from "./dialog";

export const ScheduleTriggerNode = (props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.time && nodeData?.unit
        ? `Triggers every ${nodeData.time} ${nodeData.unit}`
        : "Not configured";

    return (
        <>
            <ScheduleTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultTime={nodeData?.time as number | undefined}
                defaultUnit={nodeData?.unit as string | undefined}
                defaultEnabled={nodeData?.enabled as boolean | undefined}
            />
            <BaseTriggerNode
                {...props}
                icon={ClockIcon}
                name="Schedule Trigger"
                description={description}
                status={nodeStatus} 
                onSettings={handleOpenSettings} 
                onDoubleClick={handleOpenSettings} 
            />
        </>
    );

    function handleSubmit(values: { time?: number; unit?: string; enabled?: boolean }) {
        // Update node data with form values
        // This will be handled by the parent component or workflow state
        setDialogOpen(false);
    }
};
