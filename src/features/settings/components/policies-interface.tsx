"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface PolicyOption {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

const policyOptions: PolicyOption[] = [
    {
        id: "external-writes",
        title: "External Writes",
        description: "Require approval for emails, messages, and documents",
        enabled: true,
    },
    {
        id: "high-value-actions",
        title: "High-Value Actions",
        description: "Require approval for calendar invites and important decisions",
        enabled: true,
    },
    {
        id: "new-workflows",
        title: "New Workflows",
        description: "Require approval when creating new automated workflows",
        enabled: true,
    },
    {
        id: "sensitive-data",
        title: "Sensitive Data",
        description: "Require approval when handling sensitive information",
        enabled: true,
    },
];

export const PoliciesInterface = () => {
    const [options, setOptions] = useState<PolicyOption[]>(policyOptions);

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
                <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
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
