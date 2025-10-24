"use client";

import { Clock, Users, FileText, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScheduleItem {
    id: string;
    title: string;
    time: string;
    duration: string;
    participants: number;
    type: "meeting" | "review" | "call";
}

const mockSchedule: ScheduleItem[] = [
    {
        id: "1",
        title: "Team Standup",
        time: "9:00 AM",
        duration: "15 min",
        participants: 8,
        type: "meeting",
    },
    {
        id: "2",
        title: "Review marketing budget proposal",
        time: "9:00 AM",
        duration: "15 min",
        participants: 8,
        type: "review",
    },
    {
        id: "3",
        title: "Client Demo Call",
        time: "9:00 AM",
        duration: "15 min",
        participants: 8,
        type: "call",
    },
    {
        id: "4",
        title: "Client Demo Call",
        time: "9:00 AM",
        duration: "15 min",
        participants: 8,
        type: "call",
    },
];

export const TodayScheduleSection = () => {
    const getIcon = (type: "meeting" | "review" | "call") => {
        switch (type) {
            case "meeting":
                return <Users className="w-4 h-4 text-blue-600" />;
            case "review":
                return <FileText className="w-4 h-4 text-green-600" />;
            case "call":
                return <Phone className="w-4 h-4 text-purple-600" />;
            default:
                return <Users className="w-4 h-4 text-blue-600" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {mockSchedule.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{item.time} • {item.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
                                    <span>{item.participants}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
