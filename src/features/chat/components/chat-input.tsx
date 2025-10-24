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
    onSourcesChange?: (sources: { emails: boolean; calendar: boolean; files: boolean; drive: boolean }) => void;
}

export const ChatInput = ({ onSendMessage, onSourcesChange }: ChatInputProps) => {
    const [message, setMessage] = useState("");
    const [selectedModel, setSelectedModel] = useState("GPT-4");
    const [sources, setSources] = useState({ emails: false, calendar: false, files: false, drive: false });
    const fileInputId = "chat-file-upload-input";

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
        <div className="border-t bg-background p-3 sm:p-4 sticky bottom-0">
            <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                {/* Top controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                                {sources.emails || sources.calendar || sources.files || sources.drive ? `Sources: ${[
                                    sources.emails ? 'Gmail' : null,
                                    sources.calendar ? 'Calendar' : null,
                                    sources.files ? 'Files' : null,
                                    sources.drive ? 'Drive' : null,
                                ].filter(Boolean).join(', ')}` : 'All Sources'}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem
                                onClick={() => {
                                    const next = { ...sources, emails: !sources.emails };
                                    setSources(next);
                                    onSourcesChange?.(next);
                                }}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.emails ? "Gmail ✓" : "Gmail"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    const next = { ...sources, calendar: !sources.calendar };
                                    setSources(next);
                                    onSourcesChange?.(next);
                                }}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.calendar ? "Calendar ✓" : "Calendar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    const next = { ...sources, drive: !sources.drive };
                                    setSources(next);
                                    onSourcesChange?.(next);
                                }}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.drive ? "Drive ✓" : "Drive"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    const next = { ...sources, files: !sources.files };
                                    setSources(next);
                                    onSourcesChange?.(next);
                                }}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.files ? "Documents ✓" : "Documents"}
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
                <div className="flex items-end gap-2 sm:gap-3">
                    <div className="flex-1">
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Find all unread emails from yesterday and summarize"
                            className="min-h-[44px] resize-none"
                        />
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        <input id={fileInputId} type="file" accept=".pdf,.txt,.md,.doc,.docx" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                                const form = new FormData();
                                form.set("file", file);
                                const resp = await fetch("/api/docs/upload", { method: "POST", body: form });
                                const json = await resp.json();
                                if (resp.ok && json?.ok) {
                                    // Toggle files source on successful upload
                                    const next = { ...sources, files: true };
                                    setSources(next);
                                    onSourcesChange?.(next);
                                    // Notify quickly
                                    try { alert(`Uploaded ${file.name}`); } catch {}
                                }
                            } catch {}
                            // Reset input so the same file can be chosen again later
                            (e.target as HTMLInputElement).value = "";
                        }} />
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                            <Image className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 w-9 p-0" onClick={() => {
                            const el = document.getElementById(fileInputId) as HTMLInputElement | null;
                            el?.click();
                        }}>
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
