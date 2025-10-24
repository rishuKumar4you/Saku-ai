"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Zap,
    Clock,
    CheckCircle2,
    Activity,
    Filter,
    Mail,
    FileText,
    Users,
    AlertCircle,
    RefreshCw,
    Copy,
    ArrowUp,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

interface InsightsData {
    stats: {
        tasksAutomated: { value: number; change: number; period: string };
        avgResponseTime: { value: number; change: number; period: string };
        successRate: { value: number; change: number; period: string };
        activeWorkflows: { value: number; pending: number };
    };
    recentActivities: Array<{
        id: string;
        type: "success" | "error" | "info";
        title: string;
        description: string;
        timestamp: string;
        icon: string;
    }>;
    workflowPerformance: Array<{
        name: string;
        executions: number;
        date: string;
        color: string;
    }>;
    weeklyTrends: {
        executionVolume: { value: number; change: number };
        approvalRate: { value: number; change: number };
        traceUsage: { value: number; change: number };
    };
}

export const InsightsInterface = () => {
    const [data, setData] = useState<InsightsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("weekly");

    useEffect(() => {
        fetchInsightsData();
    }, [timeRange]);

    const fetchInsightsData = async () => {
        try {
            const response = await fetch(`/api/insights?range=${timeRange}`);
            const json = await response.json();
            setData(json.data);
        } catch (error) {
            console.error("Failed to fetch insights:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getActivityIcon = (icon: string) => {
        const icons: Record<string, any> = {
            mail: Mail,
            file: FileText,
            users: Users,
            alert: AlertCircle,
            refresh: RefreshCw,
            copy: Copy,
        };
        const Icon = icons[icon] || Activity;
        return <Icon className="w-4 h-4" />;
    };

    const getTrendIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="w-3 h-3" />;
        if (change < 0) return <TrendingDown className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    const getTrendColor = (change: number) => {
        if (change > 0) return "text-green-600";
        if (change < 0) return "text-red-600";
        return "text-gray-600";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading insights...</div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Failed to load insights</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b px-6 py-4">
                <h1 className="text-2xl font-semibold">Insights</h1>
                <p className="text-sm text-muted-foreground">
                    Overview of your AI-powered workspace activity
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {/* Tasks Automated */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tasks Automated
                                </CardTitle>
                                <Zap className="w-4 h-4 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.stats.tasksAutomated.value}</div>
                            <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor(data.stats.tasksAutomated.change)}`}>
                                <ArrowUp className="w-3 h-3" />
                                <span>{Math.abs(data.stats.tasksAutomated.change)}</span>
                                <span className="text-muted-foreground">{data.stats.tasksAutomated.period}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Avg Response Time */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Avg Response Time
                                </CardTitle>
                                <Clock className="w-4 h-4 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.stats.avgResponseTime.value}</div>
                            <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor(data.stats.avgResponseTime.change)}`}>
                                <ArrowUp className="w-3 h-3" />
                                <span>+{data.stats.avgResponseTime.change}s</span>
                                <span className="text-muted-foreground">{data.stats.avgResponseTime.period}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Success Rate */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Success Rate
                                </CardTitle>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.stats.successRate.value}%</div>
                            <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor(data.stats.successRate.change)}`}>
                                <ArrowUp className="w-3 h-3" />
                                <span>+{data.stats.successRate.change}%</span>
                                <span className="text-muted-foreground">{data.stats.successRate.period}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Workflows */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Active Workflows
                                </CardTitle>
                                <Activity className="w-4 h-4 text-yellow-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.stats.activeWorkflows.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {data.stats.activeWorkflows.pending} Pending review
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Recent Activities */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Recent Activities</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            activity.type === 'success' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'error' ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {getActivityIcon(activity.icon)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm">{activity.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <RefreshCw className="w-3 h-3" />
                                            </Button>
                                            {activity.type === 'error' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <AlertCircle className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workflow Performance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Workflow Performance</CardTitle>
                                <Select value={timeRange} onValueChange={setTimeRange}>
                                    <SelectTrigger className="w-24 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mb-4">
                                {data.workflowPerformance.map((workflow, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: workflow.color }}></div>
                                            <span className="text-sm">{workflow.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{workflow.executions}</span>
                                            <span className="text-xs text-muted-foreground">{workflow.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Simple Donut Chart */}
                            <div className="flex items-center justify-center mt-6">
                                <div className="relative w-48 h-48">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="125 251" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="75 251" strokeDashoffset="-125" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="51 251" strokeDashoffset="-200" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-2xl font-bold">20s</div>
                                        <div className="text-xs text-muted-foreground">Spending Hour</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Weekly Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-sm text-muted-foreground mb-2">Execution Volume</div>
                                <div className="text-3xl font-bold">{data.weeklyTrends.executionVolume.value}</div>
                                <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor(data.weeklyTrends.executionVolume.change)}`}>
                                    {getTrendIcon(data.weeklyTrends.executionVolume.change)}
                                    <span>+{Math.abs(data.weeklyTrends.executionVolume.change)}% from last week</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground mb-2">Approval Rate</div>
                                <div className="text-3xl font-bold">{data.weeklyTrends.approvalRate.value}%</div>
                                <div className={`flex items-center gap-1 text-xs mt-1 ${getTrendColor(data.weeklyTrends.approvalRate.change)}`}>
                                    {getTrendIcon(data.weeklyTrends.approvalRate.change)}
                                    <span>+{Math.abs(data.weeklyTrends.approvalRate.change)}% from last week</span>
                                </div>
                            </div>

                            <div>
                                <div className="text-sm text-muted-foreground mb-2">Trace Usage</div>
                                <div className="text-3xl font-bold">{data.weeklyTrends.traceUsage.value}</div>
                                <div className="text-xs text-muted-foreground mt-1">Same as last week</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

