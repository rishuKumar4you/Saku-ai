"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { BrainIcon } from "lucide-react";
import { memo, useState} from "react";
import { BaseExecutionNode } from "../base-execution-node"; 
import { FormType, GeminiDialog } from "./dialog";
import { AINodeData } from "../ai-shared";

type GeminiNodeType = Node<AINodeData>;

export const GeminiNode = memo((
    props: NodeProps<GeminiNodeType>
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
                        function: values.function,
                        prompt: values.prompt,
                        model: values.model,
                        temperature: values.temperature,
                        maxTokens: values.maxTokens,
                    }
                }
            }
            return node;
        }))  
    };
    
    const nodeStatus = "initial";
    const handleOpenSettings = () => setDialogOpen(true);

    const nodeData = props.data;
    const description = nodeData?.function && nodeData?.prompt
        ? `${nodeData.function.replace('_', ' ')} (${nodeData.model || 'gemini-1.5-pro'}): ${nodeData.prompt.substring(0, 40)}${nodeData.prompt.length > 40 ? '...' : ''}`
        : "Not configured";
    
    return (
        <>
            <GeminiDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                nodeId={props.id}
                defaultFunction={nodeData.function}
                defaultPrompt={nodeData.prompt}
                defaultModel={nodeData.model}
                defaultTemperature={nodeData.temperature}
                defaultMaxTokens={nodeData.maxTokens}
            />
            <BaseExecutionNode
                {...props}
                id={props.id}
                icon={BrainIcon}
                name="Gemini"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

GeminiNode.displayName = "GeminiNode";
