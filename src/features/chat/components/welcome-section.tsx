"use client";

import { Button } from "@/components/ui/button";
import { 
    FileText, 
    Image, 
    Search, 
    Newspaper, 
    BarChart3, 
    Code 
} from "lucide-react";

interface WelcomeSectionProps {
    onStartChat: (message: string) => void;
}

const quickActions = [
    {
        icon: FileText,
        label: "Write Copy",
        prompt: "Help me write compelling copy for my product launch"
    },
    {
        icon: Image,
        label: "Image Generation",
        prompt: "Generate an image for my blog post about AI"
    },
    {
        icon: Search,
        label: "Research",
        prompt: "Research the latest trends in artificial intelligence"
    },
    {
        icon: Newspaper,
        label: "Generate Article",
        prompt: "Write an article about the future of work"
    },
    {
        icon: BarChart3,
        label: "Data Analytics",
        prompt: "Analyze this data and provide insights"
    },
    {
        icon: Code,
        label: "Code",
        prompt: "Help me debug this JavaScript code"
    }
];

export const WelcomeSection = ({ onStartChat }: WelcomeSectionProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="text-center space-y-6 max-w-2xl">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary-foreground">S</span>
                    </div>
                </div>
                
                {/* Welcome Message */}
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground">
                        Welcome Saku AI
                    </h2>
                    <p className="text-muted-foreground">
                        Get Started By Script A Task An Chat Can Do The Rest.
                    </p>
                    <p className="text-muted-foreground">
                        Not Sure Where To Start?
                    </p>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
                    {quickActions.map((action, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent"
                            onClick={() => onStartChat(action.prompt)}
                        >
                            <action.icon className="h-5 w-5" />
                            <span className="text-sm font-medium">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};
