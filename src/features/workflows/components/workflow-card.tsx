"use client";

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useRemoveWorkflow } from "../hooks/use-workflows";
import { NodeType } from "@/generated/prisma";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    nodes: Array<{
      type: NodeType;
    }>;
  };
}

// Map node types to their corresponding logo paths
const getNodeLogo = (nodeType: NodeType): string | null => {
  switch (nodeType) {
    case NodeType.AI_OPENAI:
      return "/openai.svg";
    case NodeType.AI_GEMINI:
      return "/gemini.svg";
    case NodeType.AI_ANTHROPIC:
      return "/claude.svg";
    case NodeType.EMAIL:
    case NodeType.EMAIL_TRIGGER:
      return "/gmail.svg";
    case NodeType.HTTP_REQUEST:
      return "/slack.svg"; // Using slack as webhook representation
    case NodeType.SCHEDULE_TRIGGER:
      return "/google-calendar.svg";
    case NodeType.MANUAL_TRIGGER:
      return "/window.svg"; // Using window as manual trigger
    default:
      return null;
  }
};

// Get unique node types for a workflow
const getUniqueNodeTypes = (nodes: Array<{ type: NodeType }>): NodeType[] => {
  const uniqueTypes = new Set<NodeType>();
  nodes.forEach(node => {
    if (node.type !== NodeType.INITIAL) {
      uniqueTypes.add(node.type);
    }
  });
  return Array.from(uniqueTypes);
};

// Determine workflow status based on nodes
const getWorkflowStatus = (nodes: Array<{ type: NodeType }>): { status: "Active" | "Draft"; color: string } => {
  const hasConfiguredNodes = nodes.some(node => 
    node.type !== NodeType.INITIAL && node.type !== NodeType.MANUAL_TRIGGER
  );
  
  if (hasConfiguredNodes) {
    return { status: "Active", color: "bg-green-100 text-green-800" };
  }
  return { status: "Draft", color: "bg-gray-100 text-gray-600" };
};

// Generate workflow description based on node types
const generateDescription = (nodeTypes: NodeType[]): string => {
  const descriptions: Record<NodeType, string> = {
    [NodeType.AI_OPENAI]: "AI processing with OpenAI",
    [NodeType.AI_GEMINI]: "AI processing with Gemini", 
    [NodeType.AI_ANTHROPIC]: "AI processing with Claude",
    [NodeType.EMAIL]: "Email automation",
    [NodeType.EMAIL_TRIGGER]: "Email-triggered workflow",
    [NodeType.HTTP_REQUEST]: "HTTP request handling",
    [NodeType.SCHEDULE_TRIGGER]: "Scheduled automation",
    [NodeType.MANUAL_TRIGGER]: "Manual workflow trigger",
    [NodeType.INITIAL]: "Initial node",
  };

  if (nodeTypes.length === 0) {
    return "Configure your workflow to get started";
  }

  if (nodeTypes.length === 1) {
    return descriptions[nodeTypes[0]] || "Workflow automation";
  }

  if (nodeTypes.length <= 3) {
    return nodeTypes.map(type => descriptions[type]).join(" • ");
  }

  return `${nodeTypes.length} integrated services`;
};

export const WorkflowCard = ({ workflow }: WorkflowCardProps) => {
  const router = useRouter();
  const removeWorkflow = useRemoveWorkflow();
  
  const uniqueNodeTypes = getUniqueNodeTypes(workflow.nodes);
  const workflowStatus = getWorkflowStatus(workflow.nodes);
  const description = generateDescription(uniqueNodeTypes);

  const handleEdit = () => {
    router.push(`/workflows/${workflow.id}`);
  };

  const handleRemove = () => {
    removeWorkflow.mutate({ id: workflow.id });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Header with icons and status */}
      <div className="flex items-start justify-between mb-4">
        {/* Node Icons */}
        <div className="flex items-center gap-2">
          {uniqueNodeTypes.slice(0, 4).map((nodeType, index) => {
            const logoPath = getNodeLogo(nodeType);
            if (!logoPath) return null;
            
            return (
              <div
                key={`${nodeType}-${index}`}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <Image
                  src={logoPath}
                  alt={nodeType}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            );
          })}
          {uniqueNodeTypes.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
              +{uniqueNodeTypes.length - 4}
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${workflowStatus.color}`}>
          {workflowStatus.status}
        </div>
      </div>

      {/* Workflow Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {workflow.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {description}
      </p>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 mb-4">
        Edited {formatDistanceToNow(workflow.updatedAt, { addSuffix: true })}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handleEdit}
          variant="outline"
          size="sm"
          className="flex-1 mr-2"
        >
          Edit Workflow
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleRemove}
              className="text-red-600 focus:text-red-600"
              disabled={removeWorkflow.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
