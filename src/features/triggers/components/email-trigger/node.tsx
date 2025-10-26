"use client";

import { NodeProps, useReactFlow } from "@xyflow/react";
import { MailIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { EmailTriggerDialog } from "./dialog";

export const EmailTriggerNode = memo((props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.senderEmail 
        ? `Triggers on emails from: ${nodeData.senderEmail}`
        : "Triggers on any new email";

    const handleSubmit = (values: { senderEmail?: string; subjectFilter?: string; enabled?: boolean }) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        senderEmail: values.senderEmail,
                        subjectFilter: values.subjectFilter,
                        enabled: values.enabled ?? true,
                    }
                }
            }
            return node;
        }));
        setDialogOpen(false);
    };

    return (
        <>
            <EmailTriggerDialog 
                open={dialogOpen} 
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                defaultSenderEmail={nodeData?.senderEmail as string | undefined}
                defaultSubjectFilter={nodeData?.subjectFilter as string | undefined}
                defaultEnabled={nodeData?.enabled as boolean | undefined}
            />
            <BaseTriggerNode
                {...props}
                icon={MailIcon}
                name="New Email"
                subtitle="Gmail Trigger"
                description={description}
                status={nodeStatus} 
                onSettings={handleOpenSettings} 
                onDoubleClick={handleOpenSettings}
                tag="Gmail"
            />
        </>
    );
});

EmailTriggerNode.displayName = "EmailTriggerNode";
