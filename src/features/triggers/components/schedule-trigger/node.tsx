"use client";

import { NodeProps, useReactFlow } from "@xyflow/react";
import { ClockIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { ScheduleTriggerDialog } from "./dialog";

export const ScheduleTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.time && nodeData?.unit
        ? `Triggers every ${nodeData.time} ${nodeData.unit}`
        : "Not configured";

    const handleSubmit = (values: { time: number; unit: string; enabled: boolean }) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        time: values.time,
                        unit: values.unit,
                        enabled: values.enabled,
                    }
                }
            }
            return node;
        }));
        setDialogOpen(false);
    };

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
});

ScheduleTriggerNode.displayName = "ScheduleTriggerNode";
