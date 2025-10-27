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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
                                        <div className="text-foreground [&>h1]:text-xl [&>h1]:font-semibold [&>h1]:mb-3 [&>h1]:mt-4 [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:mt-3 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-2 [&>p]:text-sm [&>p]:leading-relaxed [&>p]:mb-2 [&>strong]:font-semibold [&>em]:italic [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mb-3 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:mb-3 [&>ol]:space-y-1 [&>li]:text-sm [&>li]:ml-2 [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:mb-3 [&>pre]:mt-2 [&>pre>code]:bg-transparent [&>pre>code]:p-0 [&>a]:text-primary [&>a]:underline [&>a]:hover:text-primary/80 [&>blockquote]:border-l-4 [&>blockquote]:border-muted-foreground/30 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-3 [&>blockquote]:text-muted-foreground [&>table]:w-full [&>table]:border-collapse [&>table]:mb-3 [&>table]:text-sm [&_th]:border [&_th]:border-muted [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-muted [&_td]:px-3 [&_td]:py-2">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({children}) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
                                                    h1: ({children}) => <h1 className="text-xl font-semibold mb-3 mt-4">{children}</h1>,
                                                    h2: ({children}) => <h2 className="text-lg font-semibold mb-2 mt-3">{children}</h2>,
                                                    h3: ({children}) => <h3 className="text-base font-semibold mb-2 mt-2">{children}</h3>,
                                                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                                    em: ({children}) => <em className="italic">{children}</em>,
                                                    ul: ({children}) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                                    ol: ({children}) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                                    li: ({children}) => <li className="text-sm ml-2">{children}</li>,
                                                    code: ({inline, children, ...props}: any) => 
                                                        inline ? (
                                                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono" {...props}>{children}</code>
                                                        ) : (
                                                            <code className="text-xs" {...props}>{children}</code>
                                                        ),
                                                    pre: ({children}) => <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-3 mt-2">{children}</pre>,
                                                    a: ({children, href}) => <a href={href} className="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                                                    blockquote: ({children}) => <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic my-3 text-muted-foreground">{children}</blockquote>,
                                                    table: ({children}) => <table className="w-full border-collapse mb-3 text-sm">{children}</table>,
                                                    th: ({children}) => <th className="border border-muted bg-muted/50 px-3 py-2 text-left font-semibold">{children}</th>,
                                                    td: ({children}) => <td className="border border-muted px-3 py-2">{children}</td>,
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
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
