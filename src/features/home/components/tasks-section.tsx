"use client";

import { useState } from "react";
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

const mockTasks: Task[] = [
    {
        id: "1",
        title: "Review marketing Budget proposal",
        time: "Today 3:00",
        priority: "high",
        completed: true,
    },
    {
        id: "2",
        title: "Review marketing Budget proposal",
        time: "Today 3:00",
        priority: "low",
        completed: true,
    },
    {
        id: "3",
        title: "Review marketing Budget proposal",
        time: "Today 3:00",
        priority: "low",
        completed: true,
    },
    {
        id: "4",
        title: "Review marketing Budget proposal",
        time: "Today 3:00",
        priority: "low",
        completed: true,
    },
];

const mockApprovals: Approval[] = [
    {
        id: "1",
        title: "Response to Client Inquiry",
        description: "Thank you for your interest in our product. I'd be happy...",
        priority: "high",
        completed: false,
    },
    {
        id: "2",
        title: "Response to Client Inquiry",
        description: "Thank you for your interest in our product. I'd be happy...",
        priority: "low",
        completed: false,
    },
    {
        id: "3",
        title: "Response to Client Inquiry",
        description: "Thank you for your interest in our product. I'd be happy...",
        priority: "low",
        completed: false,
    },
    {
        id: "4",
        title: "Response to Client Inquiry",
        description: "Thank you for your interest in our product. I'd be happy...",
        priority: "low",
        completed: false,
    },
];

interface TasksSectionProps {
    activeTab: "tasks" | "approvals";
    onTabChange: (tab: "tasks" | "approvals") => void;
}

export const TasksSection = ({ activeTab, onTabChange }: TasksSectionProps) => {
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);

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
                <div className="flex items-center justify-between">
                    <CardTitle>Tasks</CardTitle>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-red-500 text-sm font-medium">2</span>
                        </div>
                        <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Task
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
                            <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-600">{task.time}</span>
                                        {getPriorityBadge(task.priority)}
                                    </div>
                                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleTaskComplete(task.id)}
                                    className="flex items-center space-x-1"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>Mark As Complete</span>
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                    
                    <TabsContent value="approvals" className="space-y-3 mt-4">
                        {approvals.map((approval) => (
                            <div key={approval.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        {getPriorityBadge(approval.priority)}
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-1">{approval.title}</h3>
                                    <p className="text-sm text-gray-600">{approval.description}</p>
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleApprovalComplete(approval.id)}
                                    className="flex items-center space-x-1"
                                >
                                    <Check className="w-4 h-4 text-green-600" />
                                    <span>Mark As Approve</span>
                                </Button>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};
