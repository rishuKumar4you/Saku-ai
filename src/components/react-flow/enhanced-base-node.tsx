import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";
import { NodeStatus } from "./node-status-indicator";
import { CheckCheckIcon, CheckCircle2Icon, Loader2Icon, XCircleIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedBaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  status?: NodeStatus;
  nodeType?: 'trigger' | 'execution' | 'ai' | 'email' | 'http' | 'schedule' | 'manual';
  onSettings?: () => void;
  showSettings?: boolean;
}

const getNodeColor = (nodeType?: string) => {
  switch (nodeType) {
    case 'trigger':
    case 'email':
      return 'border-green-500 bg-green-50';
    case 'ai':
      return 'border-purple-500 bg-purple-50';
    case 'execution':
      return 'border-blue-500 bg-blue-50';
    case 'http':
      return 'border-orange-500 bg-orange-50';
    case 'schedule':
      return 'border-yellow-500 bg-yellow-50';
    case 'manual':
      return 'border-gray-500 bg-gray-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
};

const getIconBgColor = (nodeType?: string) => {
  switch (nodeType) {
    case 'trigger':
    case 'email':
      return 'bg-green-100';
    case 'ai':
      return 'bg-purple-100';
    case 'execution':
      return 'bg-blue-100';
    case 'http':
      return 'bg-orange-100';
    case 'schedule':
      return 'bg-yellow-100';
    case 'manual':
      return 'bg-gray-100';
    default:
      return 'bg-gray-100';
  }
};

const getIconColor = (nodeType?: string) => {
  switch (nodeType) {
    case 'trigger':
    case 'email':
      return 'text-green-600';
    case 'ai':
      return 'text-purple-600';
    case 'execution':
      return 'text-blue-600';
    case 'http':
      return 'text-orange-600';
    case 'schedule':
      return 'text-yellow-600';
    case 'manual':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

export const EnhancedBaseNode = forwardRef<
  HTMLDivElement,
  EnhancedBaseNodeProps
>(({ className, status, nodeType, onSettings, showSettings = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-lg border-2 bg-white text-gray-900 hover:shadow-md transition-shadow min-w-[200px] max-w-[220px]",
      getNodeColor(nodeType),
      className,
    )}
    tabIndex={0}
    {...props}
  >
    {props.children}
    
    {/* Settings button - always visible */}
    {showSettings && onSettings && (
      <Button
        size="sm"
        variant="ghost"
        onClick={onSettings}
        className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-200"
      >
        <Settings className="h-3 w-3 text-gray-600" />
      </Button>
    )}
    
    {/* Status indicators */}
    {status === "error" && (
      <XCircleIcon className="absolute right-8 bottom-2 size-3 text-red-600 stroke-2" />
    )}
    {status === "success" && (
      <CheckCircle2Icon className="absolute right-8 bottom-2 size-3 text-green-600 stroke-2" />
    )}
    {status === "loading" && (
      <Loader2Icon className="absolute right-8 bottom-2 size-3 text-blue-600 stroke-2 animate-spin" />
    )}
  </div>
));
EnhancedBaseNode.displayName = "EnhancedBaseNode";

/**
 * Enhanced header with icon and title
 */
export const EnhancedNodeHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    nodeType?: string;
  }
>(({ className, icon, title, subtitle, nodeType, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-3 px-4 py-3",
      className,
    )}
    {...props}
  >
    {/* Icon container */}
    <div className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center",
      getIconBgColor(nodeType)
    )}>
      <div className={cn("w-4 h-4", getIconColor(nodeType))}>
        {icon}
      </div>
    </div>
    
    {/* Title and subtitle */}
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-gray-900 text-sm truncate">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-gray-500 truncate">
          {subtitle}
        </p>
      )}
    </div>
  </div>
));
EnhancedNodeHeader.displayName = "EnhancedNodeHeader";

/**
 * Enhanced content area for description and additional info
 */
export const EnhancedNodeContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("px-4 pb-3", className)}
    {...props}
  />
));
EnhancedNodeContent.displayName = "EnhancedNodeContent";

/**
 * Enhanced footer for action buttons and tags
 */
export const EnhancedNodeFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    nodeType?: string;
  }
>(({ className, nodeType, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between px-4 pb-3",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
EnhancedNodeFooter.displayName = "EnhancedNodeFooter";

/**
 * Tag component for node type indicators
 */
export const NodeTag = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    nodeType?: string;
    children: React.ReactNode;
  }
>(({ className, nodeType, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1 rounded-md text-xs font-medium",
      getIconBgColor(nodeType),
      getIconColor(nodeType),
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
NodeTag.displayName = "NodeTag";

export { getNodeColor, getIconBgColor, getIconColor };
