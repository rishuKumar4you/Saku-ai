"use client";

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
    Lock,
    Upload,
    Paperclip,
    Mic
} from "lucide-react";

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
    return (
        <div className="border-b bg-background">
            {/* Top controls bar */}
            <div className="flex items-center justify-between px-6 py-3 border-b">
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Zap className="h-4 w-4" />
                                GPT-4
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                GPT-4
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Claude 4.5
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Upload className="h-4 w-4" />
                    </Button>
                </div>
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
