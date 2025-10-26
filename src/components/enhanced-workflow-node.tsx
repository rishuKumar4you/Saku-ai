"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { TrashIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { EnhancedBaseNode, EnhancedNodeHeader, EnhancedNodeContent, NodeTag } from "./react-flow/enhanced-base-node";

interface EnhancedWorkflowNodeProps {
    children: ReactNode;
    showToolbar?: boolean;
    onDelete?: () => void;
    onSettings?: () => void;
    name?: string;
    description?: string;
    subtitle?: string;
    icon?: ReactNode;
    nodeType?: 'trigger' | 'execution' | 'ai' | 'email' | 'http' | 'schedule' | 'manual';
    status?: 'initial' | 'loading' | 'success' | 'error';
    tag?: string;
    maxWords?: string;
    model?: string;
};

export function EnhancedWorkflowNode({ 
    children,
    showToolbar = true,
    onDelete,
    onSettings,
    name,
    description,
    subtitle,
    icon,
    nodeType = 'execution',
    status = 'initial',
    tag,
    maxWords,
    model,
}: EnhancedWorkflowNodeProps) {
    return (
        <>
            {/* Delete toolbar - only show on hover */}
            {showToolbar && onDelete && (
                <NodeToolbar>
                    <Button size="sm" variant="ghost" onClick={onDelete}>
                        <TrashIcon className="size-4"/>
                    </Button>
                </NodeToolbar>
            )}
            
            <EnhancedBaseNode
                nodeType={nodeType}
                status={status}
                onSettings={onSettings}
                showSettings={true}
            >
                {/* Header with icon, title, and subtitle */}
                <EnhancedNodeHeader
                    icon={icon}
                    title={name || 'Node'}
                    subtitle={subtitle}
                    nodeType={nodeType}
                />
                
                {/* Content area with description */}
                {description && (
                    <EnhancedNodeContent>
                        <p className="text-sm text-gray-700 leading-relaxed break-words overflow-hidden">
                            {description}
                        </p>
                    </EnhancedNodeContent>
                )}
                
                {/* Footer with tags only */}
                <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex items-center gap-2">
                        {tag && (
                            <NodeTag nodeType={nodeType}>
                                {tag}
                            </NodeTag>
                        )}
                        {maxWords && (
                            <span className="text-xs text-gray-500">
                                {maxWords}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Children (handles, etc.) */}
                {children}
            </EnhancedBaseNode>
        </>
    );
}
