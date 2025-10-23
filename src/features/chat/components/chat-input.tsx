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
import { 
    Send, 
    Image, 
    Mic, 
    Paperclip,
    ChevronDown,
    Zap,
    Network,
    Lock
} from "lucide-react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
}

export const ChatInput = ({ onSendMessage }: ChatInputProps) => {
    const [message, setMessage] = useState("");
    const [selectedModel, setSelectedModel] = useState("GPT-4");

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Top controls */}
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Zap className="h-4 w-4" />
                                {selectedModel}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedModel("GPT-4")}>
                                <Zap className="h-4 w-4 mr-2" />
                                GPT-4
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedModel("Claude 4.5")}>
                                <Zap className="h-4 w-4 mr-2" />
                                Claude 4.5
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedModel("Gemini 2.5 Pro")}>
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
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                ChatGPT
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Web
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Files
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Emails
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Zap className="h-4 w-4 mr-2" />
                                Slack
                            </DropdownMenuItem>
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
                            <DropdownMenuItem>Full Access</DropdownMenuItem>
                            <DropdownMenuItem>Limited Access</DropdownMenuItem>
                            <DropdownMenuItem>Read Only</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Input area */}
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Find all unread emails from yesterday and summarize"
                            className="min-h-[44px] resize-none"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <Image className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <Mic className="h-4 w-4" />
                        </Button>
                        <Button 
                            onClick={handleSend}
                            size="sm" 
                            className="h-9 w-9 p-0 bg-primary hover:bg-primary/90"
                            disabled={!message.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
