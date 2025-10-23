"use client";

import { useState } from "react";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { WelcomeSection } from "./welcome-section";

export const ChatInterface = () => {
    const [messages, setMessages] = useState<Array<{
        id: string;
        content: string;
        isUser: boolean;
        timestamp: Date;
    }>>([]);
    
    const [isWelcomeVisible, setIsWelcomeVisible] = useState(true);

    const handleSendMessage = (content: string) => {
        if (!content.trim()) return;
        
        const newMessage = {
            id: Date.now().toString(),
            content: content.trim(),
            isUser: true,
            timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsWelcomeVisible(false);
        
        // TODO: Add AI response logic here
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <ChatHeader />
            <div className="flex-1 overflow-hidden">
                {isWelcomeVisible && messages.length === 0 ? (
                    <WelcomeSection onStartChat={handleSendMessage} />
                ) : (
                    <ChatMessages messages={messages} />
                )}
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
};
