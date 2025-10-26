"use client";

import { NodeProps } from "@xyflow/react";
import { MailIcon } from "lucide-react";
import { BaseTriggerNode } from "../base-trigger-node";
import { memo, useState } from "react";
import { EmailTriggerDialog } from "./dialog";

export const EmailTriggerNode = (props: NodeProps) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.senderEmail 
        ? `Triggers on emails from: ${nodeData.senderEmail}`
        : "Triggers on any new email";

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
                name="Email Trigger"
                description={description}
                status={nodeStatus} 
                onSettings={handleOpenSettings} 
                onDoubleClick={handleOpenSettings} 
            />
        </>
    );

    function handleSubmit(values: { senderEmail?: string; subjectFilter?: string; enabled?: boolean }) {
        // Update node data with form values
        // This will be handled by the parent component or workflow state
        setDialogOpen(false);
    }
};
