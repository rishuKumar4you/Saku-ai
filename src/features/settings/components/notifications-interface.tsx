"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface NotificationOption {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

const notificationOptions: NotificationOption[] = [
    {
        id: "daily-summaries",
        title: "Daily Summaries",
        description: "Receive daily summaries in your inbox and messaging platforms that highlight the most important updates and emails that may require a response.",
        enabled: true,
    },
    {
        id: "product-updates",
        title: "Product Updates",
        description: "Get product updates and announcements from Read AI",
        enabled: true,
    },
    {
        id: "account-info",
        title: "Account Info",
        description: "Receive information from Read AI about your account",
        enabled: true,
    },
];

export const NotificationsInterface = () => {
    const [options, setOptions] = useState<NotificationOption[]>(notificationOptions);

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
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">
                    Manage your personal information, preferences, and account settings.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-6">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
                        >
                            <div className="flex-1 pr-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {option.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {option.description}
                                </p>
                            </div>
                            <Switch
                                checked={option.enabled}
                                onCheckedChange={() => handleToggle(option.id)}
                                className="ml-4 flex-shrink-0"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
