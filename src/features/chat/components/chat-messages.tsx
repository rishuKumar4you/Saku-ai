"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
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
    return (
        <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                            {message.isUser ? (
                                <Card className="p-4 bg-primary text-primary-foreground">
                                    <p className="text-sm">{message.content}</p>
                                </Card>
                            ) : (
                                <Card className="p-4 bg-background border">
                                    <p className="text-sm text-foreground mb-3">{message.content}</p>
                                    
                                    {/* Example email summary cards */}
                                    <div className="space-y-3 mt-4">
                                        <div className="text-sm font-medium text-muted-foreground">
                                            Found 3 unread emails from yesterday. Here's a quick summary:
                                        </div>
                                        
                                        {/* Email Card 1 */}
                                        <Card className="p-3 border-l-4 border-l-blue-500">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            Work
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            AI Sorted
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium text-sm">Sarah - Meeting Tomorrow at 12 PM</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Suggests: Add to Calendar, Reply
                                                    </p>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            Reply
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            Add To Calendar
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600">
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    View in Gmail
                                                </Button>
                                            </div>
                                        </Card>
                                        
                                        {/* Email Card 2 */}
                                        <Card className="p-3 border-l-4 border-l-blue-500">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            Work
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            AI Sorted
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium text-sm">John - Project Update Required</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Suggests: Reply, Mark as Important
                                                    </p>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            Reply
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            Add To Calendar
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600">
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    View in Gmail
                                                </Button>
                                            </div>
                                        </Card>
                                        
                                        {/* Email Card 3 */}
                                        <Card className="p-3 border-l-4 border-l-green-500">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                                            Personal
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            AI Sorted
                                                        </Badge>
                                                    </div>
                                                    <p className="font-medium text-sm">Mom - Weekend Plans</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Suggests: Reply, Set Reminder
                                                    </p>
                                                    <div className="flex gap-2 mt-3">
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            Reply
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 text-xs">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            Add To Calendar
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600">
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    View in Gmail
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                    
                                    {/* Action buttons for AI response */}
                                    <div className="flex gap-2 mt-4">
                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                            <Send className="h-3 w-3 mr-1" />
                                            Send
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                            <Save className="h-3 w-3 mr-1" />
                                            Save Draft
                                        </Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs">
                                            <Edit3 className="h-3 w-3 mr-1" />
                                            Edit Manually
                                        </Button>
                                    </div>
                                </Card>
                            )}
                            <div className={`text-xs text-muted-foreground mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                                {message.timestamp.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};
