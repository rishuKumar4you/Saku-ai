"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { MailIcon } from "lucide-react";
import { memo, useState} from "react";
import { BaseExecutionNode } from "../base-execution-node"; 
import { FormType, EmailDialog } from "@/features/executions/components/email/dialog";

type EmailNodeData = {
    receiverEmail?: string;
    subject?: string;
    content?: string;
    useTemplate?: boolean;
    template?: string;
    [key: string]: unknown;
};

type EmailNodeType = Node<EmailNodeData>;

export const EmailNode = memo((
    props: NodeProps<EmailNodeType>
) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleSubmit = (values: FormType) => {
        setNodes((nodes) => nodes.map((node) => {
            if (node.id === props.id) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        receiverEmail: values.receiverEmail,
                        subject: values.subject,
                        content: values.content,
                        useTemplate: values.useTemplate,
                        template: values.template,
                    }
                }
            }
            return node;
        }))  
    };
    
    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.receiverEmail && nodeData?.subject
        ? `To: ${nodeData.receiverEmail} - ${nodeData.subject}`
        : "Not configured";
    
    return (
        <>
            <EmailDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                nodeId={props.id}
                defaultReceiverEmail={nodeData.receiverEmail}
                defaultSubject={nodeData.subject}
                defaultContent={nodeData.content}
                defaultUseTemplate={nodeData.useTemplate}
                defaultTemplate={nodeData.template}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={MailIcon}
                name="Send Email"
                subtitle="Email Action"
                description="Sends an email to the specified recipient."
                status={nodeStatus}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
                nodeType="email"
                tag="Email"
            />
        </>
    )
});

EmailNode.displayName = "EmailNode";
