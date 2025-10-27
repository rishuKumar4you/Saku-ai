"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Search, 
    ChevronDown,
    Zap,
    Network,
    Lock
} from "lucide-react";
import { toast } from "sonner";

interface MeetingsHeaderProps {
    activeTab: "my-meetings" | "shared-with-me" | "incomplete";
    onTabChange: (tab: "my-meetings" | "shared-with-me" | "incomplete") => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const MeetingsHeader = ({ 
    activeTab, 
    onTabChange, 
    searchQuery, 
    onSearchChange 
}: MeetingsHeaderProps) => {
    const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Pro");

    const handleModelSelect = (model: string) => {
        if (model === "GPT-4" || model === "Claude 4.5") {
            toast.info("Meetings only supports Gemini for now", {
                description: "Please use Gemini 2.5 Pro for meetings.",
                duration: 4000,
            });
            return;
        }
        setSelectedModel(model);
    };

    return (
        <div className="border-b bg-background">
            {/* Top controls bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Zap className="h-4 w-4" />
                            {selectedModel}
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleModelSelect("GPT-4")}>
                            <Zap className="h-4 w-4 mr-2" />
                            GPT-4
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModelSelect("Claude 4.5")}>
                            <Zap className="h-4 w-4 mr-2" />
                            Claude 4.5
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleModelSelect("Gemini 2.5 Pro")}>
                            <Zap className="h-4 w-4 mr-2" />
                            Gemini 2.5 Pro
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Network className="h-4 w-4" />
                            All Sources
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All Sources</DropdownMenuItem>
                        <DropdownMenuItem>Google Meet</DropdownMenuItem>
                        <DropdownMenuItem>Zoom</DropdownMenuItem>
                        <DropdownMenuItem>Microsoft Teams</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Lock className="h-4 w-4" />
                            All Access
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>All Access</DropdownMenuItem>
                        <DropdownMenuItem>Limited Access</DropdownMenuItem>
                        <DropdownMenuItem>Read Only</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Main search bar */}
            <div className="px-6 py-4">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Ask anything or type / for commands..."
                        className="pl-10 h-12 text-base"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pb-4">
                <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "my-meetings" | "shared-with-me" | "incomplete")}>
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="my-meetings">My Meetings</TabsTrigger>
                        <TabsTrigger value="shared-with-me">Shared With Me</TabsTrigger>
                        <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
};
