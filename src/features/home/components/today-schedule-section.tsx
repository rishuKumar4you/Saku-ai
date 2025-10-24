"use client";

import { useEffect, useMemo, useState } from "react";
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

export const TodayScheduleSection = () => {
    const [events, setEvents] = useState<any[]>([]);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const r = await fetch("/api/dashboard", { cache: "no-store" });
                const j = await r.json();
                if (mounted) setEvents(Array.isArray(j?.data?.calendarEvents) ? j.data.calendarEvents : []);
            } catch {
                if (mounted) setEvents([]);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const items: ScheduleItem[] = useMemo(() => {
        const list: ScheduleItem[] = [];
        for (const e of (events || []).slice(0, 8)) {
            const start = (e?.start?.dateTime || e?.start || "").toString();
            const end = (e?.end?.dateTime || e?.end || "").toString();
            const title = (e?.summary || "Event").toString();
            const duration = start && end ? "30 min" : ""; // placeholder if no duration
            list.push({ id: String(e?.id || Math.random()), title, time: start, duration, participants: 0, type: "meeting" });
        }
        return list;
    }, [events]);
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
                {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                            {getIcon(item.type)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{item.time} {item.duration ? `• ${item.duration}` : ""}</span>
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
