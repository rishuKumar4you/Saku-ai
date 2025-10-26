"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Suspense } from "react";

interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt?: string;
}

export const ChatsDropdown = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChatsDropdownContent />
        </Suspense>
    );
};

const ChatsDropdownContent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

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

    const handleSelectConversation = (convId: string) => {
        router.push(`/chat?convId=${convId}`);
    };

    const currentConvId = searchParams?.get("convId");

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-between gap-x-4 h-10 px-4"
                >
                    <div className="flex items-center gap-x-4">
                        <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                        <span>Chats</span>
                    </div>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
                {/* Conversations List */}
                <div className="px-4 py-2 space-y-1">
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
            </CollapsibleContent>
        </Collapsible>
    );
};
