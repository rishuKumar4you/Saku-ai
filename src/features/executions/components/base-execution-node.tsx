"use client";

import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { memo, type ReactNode} from "react";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { EnhancedWorkflowNode } from "@/components/enhanced-workflow-node";
import { type NodeStatus } from "@/components/react-flow/node-status-indicator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useSelectedNode } from "@/hooks/use-selected-node";

interface BaseExecutionNodeProps extends NodeProps {
    icon: LucideIcon | string;
    name: string; 
    description?: string;
    subtitle?: string;
    children?: ReactNode;
    status?: NodeStatus;
    onSettings?: () => void;
    onDoubleClick?: () => void;
    tag?: string;
    maxWords?: string;
    model?: string;
    nodeType?: 'execution' | 'ai' | 'email' | 'http' | 'schedule' | 'manual';
};

export const BaseExecutionNode = memo(
    ({
        id,
        icon: Icon,
        name,
        description,
        subtitle,
        children,
        onSettings,
        onDoubleClick,
        status = "initial",
        tag,
        maxWords,
        model,
        nodeType = 'execution'
    }: BaseExecutionNodeProps) => {

        const { setNodes, setEdges } = useReactFlow();
        const isSelected = useSelectedNode(id);
        
        const handleDelete = () => { 
            setNodes((currentNodes) => {
                const updatedNodes = currentNodes.filter((node) => node.id !== id);
                return updatedNodes;
            });

            setEdges((currentEdges) => {
                const updatedEdges = currentEdges.filter(
                    (edge) => edge.source !== id && edge.target !== id
                );
                return updatedEdges;
            });
        };

        const handleCopyNodeId = async (e: React.MouseEvent) => {
            e.stopPropagation();
            try {
                await navigator.clipboard.writeText(id);
                toast.success("Node ID copied to clipboard!");
            } catch (error) {
                console.error("Failed to copy node ID:", error);
                toast.error("Failed to copy node ID");
            }
        };

        const iconElement = typeof Icon === "string" ? (
            <Image
                src={Icon}
                alt={name}
                width={16}
                height={16} />
        ) : (
            <Icon className="size-4" />
        );

        return (
            <Tooltip open={!isSelected ? undefined : false}>
                <TooltipTrigger asChild>
                    <div onDoubleClick={onDoubleClick}>
                        <EnhancedWorkflowNode
                            name={name}
                            description={description}
                            subtitle={subtitle}
                            icon={iconElement}
                            nodeType={nodeType}
                            status={status}
                            onDelete={handleDelete}
                            onSettings={onSettings}
                            tag={tag}
                            maxWords={maxWords}
                            model={model}
                        >
                            <BaseHandle
                                id="target-1"
                                type="target"
                                position={Position.Top}
                                className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full"
                            />
                            <BaseHandle
                                id="source-1"
                                type="source"
                                position={Position.Right}
                                className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full"
                            />
                        </EnhancedWorkflowNode>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-medium">Node ID: {id}</p>
                    <p className="text-xs text-muted-foreground cursor-pointer" onClick={handleCopyNodeId}>
                        Click to copy
                    </p>
                </TooltipContent>
            </Tooltip>
        )
    },
);

BaseExecutionNode.displayName = "BaseExecutionNode";

