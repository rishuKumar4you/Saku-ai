"use client";

import { useEffect, useState } from "react";
import { Clock, Check, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
    id: string;
    title: string;
    time: string;
    priority: "high" | "low";
    completed: boolean;
}

interface Approval {
    id: string;
    title: string;
    description: string;
    priority: "high" | "low";
    completed: boolean;
}

interface TasksSectionProps {
    activeTab: "tasks" | "approvals";
    onTabChange: (tab: "tasks" | "approvals") => void;
}

export const TasksSection = ({ activeTab, onTabChange }: TasksSectionProps) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [approvals, setApprovals] = useState<Approval[]>([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const r = await fetch("/api/dashboard", { cache: "no-store" });
                const j = await r.json();
                const msgs: any[] = Array.isArray(j?.data?.gmailMessages) ? j.data.gmailMessages : [];
                const t: Task[] = msgs.slice(0, 5).map((m: any, i: number) => ({
                    id: String(m?.id || i),
                    title: `Reply to: ${String(m?.subject || "(No Subject)")}`,
                    time: String(m?.date || ""),
                    priority: "low",
                    completed: false,
                }));
                const cals: any[] = Array.isArray(j?.data?.calendarEvents) ? j.data.calendarEvents : [];
                const a: Approval[] = cals.slice(0, 5).map((e: any, i: number) => ({
                    id: String(e?.id || i),
                    title: String(e?.summary || "Calendar Event"),
                    description: String(e?.start?.dateTime || e?.start || ""),
                    priority: "high",
                    completed: false,
                }));
                if (mounted) {
                    setTasks(t);
                    setApprovals(a);
                }
            } catch {
                if (mounted) {
                    setTasks([]);
                    setApprovals([]);
                }
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleTaskComplete = (taskId: string) => {
        setTasks(prev => prev.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleApprovalComplete = (approvalId: string) => {
        setApprovals(prev => prev.map(approval => 
            approval.id === approvalId ? { ...approval, completed: !approval.completed } : approval
        ));
    };

    const getPriorityBadge = (priority: "high" | "low") => {
        if (priority === "high") {
            return <Badge variant="destructive" className="text-xs">high</Badge>;
        }
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">low</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base sm:text-lg">Tasks</CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 text-sm font-medium">2</span>
                        </div>
                        <Button size="sm" className="shrink-0">
                            <Plus className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">New Task</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "tasks" | "approvals")}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="approvals">Approvals (2)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="tasks" className="space-y-3 mt-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{task.time}</span>
                                        </div>
                                        {getPriorityBadge(task.priority)}
                                    </div>
                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{task.title}</h3>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleTaskComplete(task.id)}
                                    className="flex items-center justify-center space-x-1 shrink-0 w-full sm:w-auto"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="hidden sm:inline">Mark As Complete</span>
                                    <span className="sm:hidden">Complete</span>
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="approvals" className="space-y-3 mt-4">
                        {approvals.map((approval) => (
                            <div key={approval.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        {getPriorityBadge(approval.priority)}
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">{approval.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{approval.description}</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprovalComplete(approval.id)}
                                    className="flex items-center justify-center space-x-1 shrink-0 w-full sm:w-auto"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span className="hidden sm:inline">Mark As Approve</span>
                                    <span className="sm:hidden">Approve</span>
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
