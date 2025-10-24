"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface AISuggestion {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    actionText: string;
}

export const AISuggestionsSection = () => {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const r = await fetch("/api/dashboard", { cache: "no-store" });
                const j = await r.json();
                const list: AISuggestion[] = Array.isArray(j?.data?.suggestions) ? j.data.suggestions : [];
                if (mounted) setSuggestions(list);
            } catch {
                if (mounted) setSuggestions([]);
            }
        })();
        return () => { mounted = false; };
    }, []);
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

    const handleAction = (suggestion: AISuggestion) => {
        // Navigate to chat with pre-filled context
        const query = encodeURIComponent(suggestion.title);
        window.location.href = `/chat?prompt=${query}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base sm:text-lg">AI Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestions.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4">
                        No suggestions available
                    </div>
                ) : (
                    suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex flex-col sm:flex-row items-start justify-between gap-3 p-3 sm:p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{suggestion.title}</h3>
                                    {getPriorityBadge(suggestion.priority)}
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{suggestion.description}</p>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleAction(suggestion)}
                                className="shrink-0 w-full sm:w-auto sm:ml-4"
                            >
                                {suggestion.actionText}
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
