"use client";

import { CheckCircle, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TraceEntry {
    id: string;
    status: "completed" | "processing" | "failed";
    timestamp: string;
    duration: string;
    query: string;
    sources: string[];
}

const mockTraceEntries: TraceEntry[] = [
    {
        id: "1",
        status: "completed",
        timestamp: "10:30:15",
        duration: "0.1s",
        query: "Q3 marketing strategy Discussion",
        sources: ["Gmail", "Slack", "Docs"],
    },
    {
        id: "2",
        status: "completed",
        timestamp: "10:30:15",
        duration: "0.1s",
        query: "Q3 marketing strategy Discussion",
        sources: ["Gmail", "Slack", "Docs"],
    },
];

export const AITraceSection = () => {
    const getStatusBadge = (status: "completed" | "processing" | "failed") => {
        switch (status) {
            case "completed":
                return (
                    <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Completed</span>
                    </div>
                );
            case "processing":
                return (
                    <Badge variant="secondary" className="text-xs">
                        Processing
                    </Badge>
                );
            case "failed":
                return (
                    <Badge variant="destructive" className="text-xs">
                        Failed
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Trace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockTraceEntries.map((entry) => (
                    <div key={entry.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                                {getStatusBadge(entry.status)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{entry.timestamp}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {entry.duration}
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Search Query:</span>
                                <span className="text-sm text-gray-600">{entry.query}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Sources:</span>
                                <span className="text-sm text-gray-600">{entry.sources.join(", ")}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
