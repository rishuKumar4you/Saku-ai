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
import Image from "next/image";

interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatMessagesProps {
    messages: Message[];
    isStreaming?: boolean;
}

// Typing Animation Component
const TypingIndicator = () => {
    return (
        <div className="flex gap-2">
            {/* AI Avatar */}
            <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                    <Image 
                        src="/logos/logo.svg" 
                        alt="Saku AI" 
                        width={20} 
                        height={20}
                    />
                </div>
            </div>
            
            {/* Animated Dots */}
            <div className="max-w-[85%] sm:max-w-[75%]">
                <Card className="p-4 bg-background border">
                    <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">Saku is thinking...</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export const ChatMessages = ({ messages, isStreaming = false }: ChatMessagesProps) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isStreaming]);

    return (
        <ScrollArea className="flex-1 px-3 py-3 sm:px-6 sm:py-4">
            <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-2 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* AI Avatar - only show for bot messages */}
                        {!message.isUser && (
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                                    <Image 
                                        src="/logos/logo.svg" 
                                        alt="Saku AI" 
                                        width={20} 
                                        height={20}
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div className={`max-w-[85%] sm:max-w-[75%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                            {message.isUser ? (
                                <Card className="p-4 bg-primary text-primary-foreground">
                                    <p className="text-sm">{message.content}</p>
                                </Card>
                            ) : (
                                <Card className="p-4 bg-background border">
                                    {message.content ? (
                                        <p className="text-sm text-foreground whitespace-pre-wrap break-words">{message.content}</p>
                                    ) : (
                                        // Show typing indicator for empty bot messages
                                        <div className="flex items-center gap-1">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            )}
                            <div className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Show typing indicator when streaming but no assistant message yet */}
                {isStreaming && messages.length > 0 && messages[messages.length - 1].isUser && (
                    <TypingIndicator />
                )}
                
                <div ref={bottomRef} />
            </div>
        </ScrollArea>
    );
};
