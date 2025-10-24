"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface MonitoringOption {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

const monitoringOptions: MonitoringOption[] = [
    {
        id: "time-tracking",
        title: "Time Tracking",
        description: "Track time spent on different activities",
        enabled: true,
    },
    {
        id: "app-usage",
        title: "App Usage Monitoring",
        description: "Monitor which applications you use most",
        enabled: false,
    },
    {
        id: "context-awareness",
        title: "Context Awareness",
        description: "Allow AI to understand your current work context",
        enabled: true,
    },
    {
        id: "smart-suggestions",
        title: "Smart Suggestions",
        description: "Receive proactive workflow suggestions",
        enabled: true,
    },
];

export const MonitoringInterface = () => {
    const [options, setOptions] = useState<MonitoringOption[]>(monitoringOptions);

    const handleToggle = (id: string) => {
        setOptions(prevOptions =>
            prevOptions.map(option =>
                option.id === id ? { ...option, enabled: !option.enabled } : option
            )
        );
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Monitoring Profile</h1>
                <p className="text-gray-600 mt-2">
                    Manage your personal information, preferences, and account settings.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-6">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                            <div className="flex-1">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    {option.title}
                                </h3>
                                <p className="text-gray-600">
                                    {option.description}
                                </p>
                            </div>
                            <Switch
                                checked={option.enabled}
                                onCheckedChange={() => handleToggle(option.id)}
                                className="ml-4"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
