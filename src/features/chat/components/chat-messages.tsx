"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Mail, 
    Calendar, 
    Send, 
    Save, 
    Edit3,
    ExternalLink 
} from "lucide-react";

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatMessagesProps {
    messages: Message[];
}

export const ChatMessages = ({ messages }: ChatMessagesProps) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <ScrollArea className="flex-1 px-3 py-3 sm:px-6 sm:py-4">
            <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[90%] sm:max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                            {message.isUser ? (
                                <Card className="p-4 bg-primary text-primary-foreground">
                                    <p className="text-sm">{message.content}</p>
                                </Card>
                            ) : (
                                <Card className="p-4 bg-background border">
                                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">{message.content}</p>
                                </Card>
                            )}
                            <div className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
};
