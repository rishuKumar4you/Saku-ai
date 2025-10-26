"use client";

import { useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import { BrainIcon } from "lucide-react";
import { memo, useState} from "react";
import { BaseExecutionNode } from "../base-execution-node"; 
import { FormType, AnthropicDialog } from "./dialog";
import { AINodeData } from "../ai-shared";

type AnthropicNodeType = Node<AINodeData>;

export const AnthropicNode = memo((
    props: NodeProps<AnthropicNodeType>
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
        ? `${nodeData.function.replace('_', ' ')} (${nodeData.model || 'claude-3-5-sonnet'}): ${nodeData.prompt.substring(0, 40)}${nodeData.prompt.length > 40 ? '...' : ''}`
        : "Not configured";
    
    return (
        <>
            <AnthropicDialog
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
                name="Anthropic"
                status={nodeStatus}
                description={description}
                onSettings={handleOpenSettings}
                onDoubleClick={handleOpenSettings}
            />
        </>
    )
});

AnthropicNode.displayName = "AnthropicNode";
