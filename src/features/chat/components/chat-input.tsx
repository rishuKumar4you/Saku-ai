"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Send, 
    Paperclip,
    ChevronDown,
    Zap,
    Network,
    Lock,
    Image
} from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onSourcesChange?: (sources: { emails: boolean; calendar: boolean; files: boolean; drive: boolean }) => void;
    onCheckConnection?: (type: 'gmail' | 'drive' | 'calendar') => Promise<boolean>;
}

export const ChatInput = ({ onSendMessage, onSourcesChange, onCheckConnection }: ChatInputProps) => {
    const [message, setMessage] = useState("");
    const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Pro");
    const [sources, setSources] = useState({ emails: false, calendar: false, files: false, drive: false });
    const fileInputId = "chat-file-upload-input";

    const handleModelSelect = (model: string) => {
        if (model === "GPT-4" || model === "Claude 4.5") {
            toast.info("Right now we only support Gemini", {
                description: "Please use Gemini 2.5 Pro for now.",
                duration: 4000,
            });
            return;
        }
        setSelectedModel(model);
    };

    const handleSourceToggle = async (sourceType: 'emails' | 'calendar' | 'drive' | 'files') => {
        // For files, no connection check needed
        if (sourceType === 'files') {
            const next = { ...sources, [sourceType]: !sources[sourceType] };
            setSources(next);
            onSourcesChange?.(next);
            return;
        }

        // Check if trying to enable the source
        if (!sources[sourceType]) {
            // Map source types to connector types
            const connectorMap = {
                emails: 'gmail' as const,
                calendar: 'calendar' as const,
                drive: 'drive' as const,
            };

            const connectorType = connectorMap[sourceType];
            
            // Check if connected (only if callback is provided)
            if (onCheckConnection) {
                const isConnected = await onCheckConnection(connectorType);
                
                if (!isConnected) {
                    // Show toast and don't toggle
                    const sourceNames = {
                        emails: 'Gmail',
                        calendar: 'Google Calendar',
                        drive: 'Google Drive',
                    };
                    
                    toast.warning(`${sourceNames[sourceType]} not connected`, {
                        description: `Please connect ${sourceNames[sourceType]} in Settings > Integrations first.`,
                        duration: 5000,
                        action: {
                            label: "Go to Settings",
                            onClick: () => {
                                window.location.href = '/settings/integrations';
                            }
                        }
                    });
                    return;
                }
            }
        }

        // If connected or disabling, proceed with toggle
        const next = { ...sources, [sourceType]: !sources[sourceType] };
        setSources(next);
        onSourcesChange?.(next);
    };

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        // Allow Shift+Enter for new lines (default behavior)
    };

    return (
        <div className="border-t bg-background px-2 py-1 sticky bottom-0">
            <div className="max-w-4xl mx-auto space-y-1">
                {/* Top controls - right aligned */}
                <div className="flex flex-wrap items-center justify-end gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
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
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
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
                                onClick={() => handleSourceToggle('emails')}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.emails ? "Gmail ✓" : "Gmail"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleSourceToggle('calendar')}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.calendar ? "Calendar ✓" : "Calendar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleSourceToggle('drive')}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.drive ? "Drive ✓" : "Drive"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleSourceToggle('files')}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                {sources.files ? "Documents ✓" : "Documents"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
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

                {/* Input area with icons inside */}
                <div className="relative">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Find all unread emails from yesterday and summarize"
                        className="min-h-[80px] resize-none rounded-2xl w-full px-4 py-3 pr-32 border border-input bg-white text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                    />
                    
                    {/* Action icons positioned inside at bottom-right */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
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
                                    // Notify user of successful upload
                                    toast.success(`Uploaded ${file.name}`);
                                }
                            } catch {
                                toast.error("Failed to upload document");
                            }
                            // Reset input so the same file can be chosen again later
                            (e.target as HTMLInputElement).value = "";
                        }} />
                        
                        {/* Image/Gallery Icon */}
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-accent"
                            onClick={() => {
                                const el = document.getElementById(fileInputId) as HTMLInputElement | null;
                                el?.click();
                            }}
                        >
                            <Image className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        
                        {/* Send Button - Blue/Primary */}
                        <Button 
                            onClick={handleSend}
                            size="sm" 
                            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
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
