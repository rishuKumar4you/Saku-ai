"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AISuggestion {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    actionText: string;
}

const mockSuggestions: AISuggestion[] = [
    {
        id: "1",
        title: "Review pending approvals",
        description: "2 high-priority items awaiting your approval for over 15 minutes.",
        priority: "high",
        actionText: "Review Now",
    },
    {
        id: "2",
        title: "Schedule follow-up with Sarah Chen",
        description: "No response to your email from 3 days ago about Q3 campaign results.",
        priority: "medium",
        actionText: "Schedule Meeting",
    },
    {
        id: "3",
        title: "Prepare for tomorrow's standup",
        description: "2 high-priority items awaiting your approval for over 15 minutes.",
        priority: "low",
        actionText: "Review Now",
    },
];

export const AISuggestionsSection = () => {
    const getPriorityBadge = (priority: "high" | "medium" | "low") => {
        switch (priority) {
            case "high":
                return <Badge variant="destructive" className="text-xs">high</Badge>;
            case "medium":
                return <Badge className="text-xs bg-orange-100 text-orange-800">medium</Badge>;
            case "low":
                return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">low</Badge>;
            default:
                return <Badge variant="secondary" className="text-xs">low</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                                {getPriorityBadge(suggestion.priority)}
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        </div>
                        <Button size="sm" variant="outline" className="ml-4">
                            {suggestion.actionText}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
