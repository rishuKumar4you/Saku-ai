"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import {
    GlobeIcon,
    MousePointerIcon,
} from "lucide-react";

import { useCallback } from "react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { NodeType } from "@/generated/prisma";
import { Separator } from "./ui/separator";

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;

};

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Trigger manually",
        description: "Runs the flow on clicking a button. Good for getting started quickly.",
        icon: MousePointerIcon,
    },

];

const executionNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "HTTP Request",
        description: "Makes an HTTP request",
        icon: GlobeIcon,
    },

];

interface NodeSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
};

export function NodeSelector({
    open,
    onOpenChange,
    children
}: NodeSelectorProps) {

    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
    
    const handleNodeSelect = useCallback((nodeType: NodeTypeOption) => {

        // you should not be able to add two manual triggers.
        if (nodeType.type === NodeType.MANUAL_TRIGGER) {
            const nodes = getNodes();
            const hasManualTrigger = nodes.some(
                (node) => node.type === NodeType.MANUAL_TRIGGER,
            );
            if (hasManualTrigger) {
                toast.error("Only one manual trigger is allowed per workflow.");
                return;
            }          
        }
        setNodes((nodes) => {
            const hasInitialTrigger = nodes.some(
                (node) => node.type === NodeType.INITIAL,
            );

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            const flowPosition = screenToFlowPosition({
                x: centerX + (Math.random() - 0.5) * 200,
                y: centerY + (Math.random() - 0.5) * 200,
            });

            const newNode = {
                id: createId(),
                data: {},
                position: flowPosition,
                type: nodeType.type,
            };
            
            if (hasInitialTrigger) {
                return [newNode];
            }

            return [...nodes, newNode];
        });

        onOpenChange(false);
    }, [setNodes, getNodes, onOpenChange, screenToFlowPosition]);
    
    return (

        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md
            overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>
                        What trigger this workflow?
                    </SheetTitle>
                    <SheetDescription>
                        A trigger is a step that starts your workflow.
                    </SheetDescription>
                </SheetHeader>
                <div>
                    {triggerNodes.map((nodeType) => {
                        const Icon = nodeType.icon;

                        return (
                            <div
                                key={nodeType.type}
                                className="w-full justify-start
                                h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 
                                border-transparent hover:border-l-primary"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full 
                                overflow-hidden">
                                    {typeof Icon == "string" ? (
                                        <img
                                            src={Icon}
                                            alt={nodeType.label}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                            <Icon className="size-5"/>
                                    )}

                                
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            <Separator/>       
                <div>
                    {executionNodes.map((nodeType) => {
                        const Icon = nodeType.icon;

                        return (
                            <div
                                key={nodeType.type}
                                className="w-full justify-start
                                h-auto py-5 px-4 rounded-none cursor-pointer border-l-2 
                                border-transparent hover:border-l-primary"
                                onClick={() =>  handleNodeSelect(nodeType)}
                            >
                                <div className="flex items-center gap-6 w-full 
                                overflow-hidden">
                                    {typeof Icon == "string" ? (
                                        <img
                                            src={Icon}
                                            alt={nodeType.label}
                                            className="size-5 object-contain rounded-sm"
                                        />
                                    ) : (
                                            <Icon className="size-5"/>
                                    )}

                                
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-sm font-medium">
                                            {nodeType.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {nodeType.description}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </SheetContent>
        </Sheet>
    );

};

