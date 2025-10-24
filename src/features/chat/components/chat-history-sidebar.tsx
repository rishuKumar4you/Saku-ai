"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt?: string;
}

interface ChatHistorySidebarProps {
    currentConvId?: string | null;
}

export const ChatHistorySidebar = ({ currentConvId }: ChatHistorySidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const resp = await fetch("/api/conversations", { cache: "no-store" });
            const data = await resp.json();
            if (Array.isArray(data?.conversations)) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDisplayTitle = (conv: Conversation) => {
        if (conv.title && conv.title.trim()) {
            return conv.title;
        }
        const date = new Date(conv.createdAt || conv.updatedAt || new Date());
        return `New Chat - ${date.toLocaleDateString()}`;
    };

    const handleNewChat = () => {
        router.push("/chat");
        router.refresh();
    };

    const handleSelectConversation = (convId: string) => {
        router.push(`/chat?convId=${convId}`);
    };

    if (isCollapsed) {
        return (
            <div className="h-full w-12 border-r bg-background flex flex-col items-center py-4 gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(false)}
                    className="shrink-0"
                    title="Expand sidebar"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNewChat}
                    className="shrink-0"
                    title="New chat"
                >
                    <Plus className="w-4 h-4" />
                </Button>
                <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto">
                    {conversations.slice(0, 5).map((conv) => (
                        <Button
                            key={conv.id}
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSelectConversation(conv.id)}
                            className={cn(
                                "shrink-0",
                                currentConvId === conv.id && "bg-accent"
                            )}
                            title={getDisplayTitle(conv)}
                        >
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-64 border-r bg-background flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-sm">Chat History</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(true)}
                    className="shrink-0 h-8 w-8"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
                <Button
                    onClick={handleNewChat}
                    className="w-full"
                    variant="outline"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                        Loading...
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                        No conversations yet
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                "hover:bg-accent/50",
                                currentConvId === conv.id ? "bg-accent" : ""
                            )}
                        >
                            <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">
                                        {getDisplayTitle(conv)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {conv.updatedAt
                                            ? new Date(conv.updatedAt).toLocaleDateString()
                                            : new Date(conv.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

