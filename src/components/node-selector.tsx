"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import {
    GlobeIcon,
    MousePointerIcon,
    BrainIcon,
    MailIcon,
    ClockIcon,
    XIcon,
    SearchIcon,
    DatabaseIcon,
    MessageSquareIcon,
    SendIcon,
    ZapIcon,
    FileTextIcon,
    BarChartIcon,
} from "lucide-react";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { NodeType } from "@/generated/prisma";
import { Input } from "./ui/input";

export type NodeTypeOption = {
    type: NodeType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }> | string;

};

const triggerNodes: NodeTypeOption[] = [
    {
        type: NodeType.EMAIL_TRIGGER,
        label: "Email Trigger",
        description: "Gmail, Outlook",
        icon: MailIcon,
    },
    {
        type: NodeType.HTTP_REQUEST,
        label: "Webhook",
        description: "Receive HTTP requests",
        icon: GlobeIcon,
    },
    {
        type: NodeType.SCHEDULE_TRIGGER,
        label: "Schedule",
        description: "Time-based triggers",
        icon: ClockIcon,
    },
];

const aiProcessingNodes: NodeTypeOption[] = [
    {
        type: NodeType.AI_OPENAI,
        label: "OpenAI",
        description: "AI processing with OpenAI models",
        icon: BrainIcon,
    },
    {
        type: NodeType.AI_ANTHROPIC,
        label: "Anthropic",
        description: "AI processing with Anthropic Claude models",
        icon: BrainIcon,
    },
    {
        type: NodeType.AI_GEMINI,
        label: "Gemini",
        description: "AI processing with Google Gemini models",
        icon: BrainIcon,
    },
];

const outputNodes: NodeTypeOption[] = [
    {
        type: NodeType.HTTP_REQUEST,
        label: "Slack Message",
        description: "Post to channel",
        icon: MessageSquareIcon,
    },
    {
        type: NodeType.EMAIL,
        label: "Send Email",
        description: "Send notifications",
        icon: SendIcon,
    },
    {
        type: NodeType.MANUAL_TRIGGER,
        label: "Update Database",
        description: "Store data",
        icon: DatabaseIcon,
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
    const [searchQuery, setSearchQuery] = useState("");
    const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
    
    // Combine all nodes for search
    const allNodes = [...triggerNodes, ...aiProcessingNodes, ...outputNodes];
    
    // Filter nodes based on search query
    const filteredNodes = allNodes.filter(node => 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
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
    
    const renderNodeSection = (title: string, nodes: NodeTypeOption[]) => {
        const sectionNodes = nodes.filter(node => 
            filteredNodes.includes(node)
        );
        
        if (sectionNodes.length === 0) return null;
        
        return (
            <div key={title} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
                <div className="space-y-1">
                    {sectionNodes.map((nodeType) => {
                        const Icon = nodeType.icon;
                        const iconColor = getIconColor(nodeType.type);

                        return (
                            <div
                                key={nodeType.type}
                                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => handleNodeSelect(nodeType)}
                            >
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${iconColor}`}>
                                    {typeof Icon === "string" ? (
                                        <img
                                            src={Icon}
                                            alt={nodeType.label}
                                            className="w-5 h-5 object-contain"
                                        />
                                    ) : (
                                        <Icon className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900">
                                        {nodeType.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {nodeType.description}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getIconColor = (nodeType: NodeType) => {
        switch (nodeType) {
            case NodeType.EMAIL_TRIGGER:
            case NodeType.EMAIL:
                return "bg-green-500";
            case NodeType.HTTP_REQUEST:
                return "bg-orange-500";
            case NodeType.SCHEDULE_TRIGGER:
                return "bg-yellow-500";
            case NodeType.AI_OPENAI:
            case NodeType.AI_ANTHROPIC:
            case NodeType.AI_GEMINI:
                return "bg-purple-500";
            case NodeType.MANUAL_TRIGGER:
                return "bg-red-500";
            default:
                return "bg-blue-500";
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
                <SheetHeader className="p-6 pb-0">
                    <SheetTitle className="text-lg font-semibold text-gray-900">Components</SheetTitle>
                </SheetHeader>
                <div className="p-6 pt-4">

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                        />
                    </div>

                    {/* Node Sections */}
                    <div className="space-y-6">
                        {renderNodeSection("TRIGGERS", triggerNodes)}
                        {renderNodeSection("AI PROCESSING", aiProcessingNodes)}
                        {renderNodeSection("OUTPUTS", outputNodes)}
                    </div>

                    {/* No results message */}
                    {filteredNodes.length === 0 && searchQuery && (
                        <div className="text-center py-8 text-gray-500">
                            No components found matching "{searchQuery}"
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );

};

