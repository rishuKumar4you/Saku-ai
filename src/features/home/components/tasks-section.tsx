"use client";

import { useEffect, useState } from "react";
import { Clock, Check, Plus, AlertTriangle, Loader2 } from "lucide-react";
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
    const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
    const [loadingApprovalId, setLoadingApprovalId] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                // Fetch both dashboard data (for display) and backend tasks (for state)
                const [dashboardResp, tasksResp] = await Promise.all([
                    fetch("/api/dashboard", { cache: "no-store" }),
                    fetch("/api/tasks", { cache: "no-store" }),
                ]);
                
                const dashboardData = await dashboardResp.json();
                const tasksData = await tasksResp.json();
                
                const msgs: any[] = Array.isArray(dashboardData?.data?.gmailMessages) ? dashboardData.data.gmailMessages : [];
                const existingTasks: any[] = Array.isArray(tasksData?.tasks) ? tasksData.tasks : [];
                
                // Create task map from existing tasks
                const taskMap = new Map(existingTasks.map((t: any) => [t.sourceId || t.id, t]));
                
                // Map Gmail messages to tasks, preserving backend state
                const t: Task[] = msgs.slice(0, 5).map((m: any) => {
                    const sourceId = String(m?.id || "");
                    const existingTask = taskMap.get(sourceId);
                    return {
                        id: existingTask?.id || sourceId,
                        title: `Reply to: ${String(m?.subject || "(No Subject)")}`,
                        time: String(m?.date || ""),
                        priority: "low",
                        completed: existingTask?.completed || false,
                    };
                });
                
                const cals: any[] = Array.isArray(dashboardData?.data?.calendarEvents) ? dashboardData.data.calendarEvents : [];
                const a: Approval[] = cals.slice(0, 5).map((e: any) => {
                    const sourceId = String(e?.id || "");
                    const existingTask = taskMap.get(sourceId);
                    return {
                        id: existingTask?.id || sourceId,
                        title: String(e?.summary || "Calendar Event"),
                        description: String(e?.start?.dateTime || e?.start || ""),
                        priority: "high",
                        completed: existingTask?.completed || false,
                    };
                });
                
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

    const handleTaskComplete = async (taskId: string) => {
        setLoadingTaskId(taskId);
        try {
            // Find the task to toggle
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            
            // Update in backend
            const formData = new FormData();
            formData.set('completed', String(!task.completed));
            
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                body: formData,
            });
            
            if (response.ok) {
                // Update local state on success
                setTasks(prev => prev.map(t => 
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                ));
            } else {
                throw new Error('Failed to update task');
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            alert('Failed to update task. Please try again.');
        } finally {
            setLoadingTaskId(null);
        }
    };

    const handleApprovalComplete = async (approvalId: string) => {
        setLoadingApprovalId(approvalId);
        try {
            // Find the approval to toggle
            const approval = approvals.find(a => a.id === approvalId);
            if (!approval) return;
            
            // Update in backend (approvals are also tasks)
            const formData = new FormData();
            formData.set('completed', String(!approval.completed));
            
            const response = await fetch(`/api/tasks/${approvalId}`, {
                method: 'PUT',
                body: formData,
            });
            
            if (response.ok) {
                // Update local state on success
                setApprovals(prev => prev.map(a => 
                    a.id === approvalId ? { ...a, completed: !a.completed } : a
                ));
            } else {
                throw new Error('Failed to update approval');
            }
        } catch (error) {
            console.error('Failed to update approval:', error);
            alert('Failed to update approval. Please try again.');
        } finally {
            setLoadingApprovalId(null);
        }
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
                            <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg transition-all ${
                                task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center flex-wrap gap-2 mb-1">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">{task.time}</span>
                                        </div>
                                        {getPriorityBadge(task.priority)}
                                    </div>
                                    <h3 className={`font-medium text-sm sm:text-base truncate ${
                                        task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                    }`}>{task.title}</h3>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleTaskComplete(task.id)}
                                    disabled={loadingTaskId === task.id}
                                    className="flex items-center justify-center space-x-1 shrink-0 w-full sm:w-auto"
                                >
                                    {loadingTaskId === task.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className={`w-4 h-4 ${task.completed ? 'text-green-600' : 'text-gray-400'}`} />
                                    )}
                                    <span className="hidden sm:inline">
                                        {task.completed ? 'Completed' : 'Mark As Complete'}
                                    </span>
                                    <span className="sm:hidden">
                                        {task.completed ? 'Done' : 'Complete'}
                                    </span>
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="approvals" className="space-y-3 mt-4">
                        {approvals.map((approval) => (
                            <div key={approval.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border rounded-lg transition-all ${
                                approval.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        {getPriorityBadge(approval.priority)}
                                    </div>
                                    <h3 className={`font-medium mb-1 text-sm sm:text-base ${
                                        approval.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                    }`}>{approval.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{approval.description}</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprovalComplete(approval.id)}
                                    disabled={loadingApprovalId === approval.id}
                                    className="flex items-center justify-center space-x-1 shrink-0 w-full sm:w-auto"
                                >
                                    {loadingApprovalId === approval.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className={`w-4 h-4 ${approval.completed ? 'text-green-600' : 'text-gray-400'}`} />
                                    )}
                                    <span className="hidden sm:inline">
                                        {approval.completed ? 'Approved' : 'Mark As Approve'}
                                    </span>
                                    <span className="sm:hidden">
                                        {approval.completed ? 'Done' : 'Approve'}
                                    </span>
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
