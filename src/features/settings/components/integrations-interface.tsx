"use client";

import { useState } from "react";
import { Search, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    status: "connected" | "disconnected";
    account?: string;
    action: "manage" | "connect";
}

const integrations: Integration[] = [
    {
        id: "google-calendar",
        name: "Google Calendar",
        description: "john@acme.com",
        icon: "📅",
        status: "connected",
        account: "john@acme.com",
        action: "manage",
    },
    {
        id: "outlook-calendar",
        name: "Outlook Calendar",
        description: "Microsoft 365 & Exchange",
        icon: "📅",
        status: "disconnected",
        action: "connect",
    },
    {
        id: "slack",
        name: "Slack",
        description: "acme.slack.com",
        icon: "💬",
        status: "connected",
        account: "acme.slack.com",
        action: "manage",
    },
    {
        id: "discord",
        name: "Discord",
        description: "Voice and text chat",
        icon: "🎮",
        status: "disconnected",
        action: "connect",
    },
    {
        id: "notion",
        name: "Notion",
        description: "Workspace: Acme Team",
        icon: "📝",
        status: "connected",
        account: "Workspace: Acme Team",
        action: "manage",
    },
    {
        id: "google-drive",
        name: "Google Drive",
        description: "googledrive.com",
        icon: "💾",
        status: "connected",
        account: "googledrive.com",
        action: "manage",
    },
];

const categories = [
    {
        title: "Calendar",
        description: "Connect your calendar apps to automatically sync meetings and events.",
        integrations: ["google-calendar", "outlook-calendar"],
    },
    {
        title: "Communication",
        description: "Connect your communication tools to streamline your workflow.",
        integrations: ["slack", "discord"],
    },
    {
        title: "Productivity",
        description: "Connect productivity tools to enhance your workflow efficiency.",
        integrations: ["notion"],
    },
    {
        title: "Storage",
        description: "Connect your storage solutions to access files seamlessly.",
        integrations: ["google-drive"],
    },
];

export const IntegrationsInterface = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredIntegrations = integrations.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIntegrationById = (id: string) => integrations.find(i => i.id === id);

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
                <p className="text-gray-600 mt-2">
                    Manage your personal information, preferences, and account settings.
                </p>
            </div>

            {/* Search and Add Integration */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search integrations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add integration
                </Button>
            </div>

            {/* Integration Categories */}
            <div className="space-y-8">
                {categories.map((category) => (
                    <div key={category.title} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">{category.title}</h2>
                            <p className="text-gray-600 mt-1">{category.description}</p>
                        </div>

                        <div className="space-y-4">
                            {category.integrations.map((integrationId) => {
                                const integration = getIntegrationById(integrationId);
                                if (!integration) return null;

                                return (
                                    <div
                                        key={integration.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="text-2xl">{integration.icon}</div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {integration.name}
                                                </h3>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    {integration.status === "connected" && (
                                                        <>
                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                            <span className="text-sm text-green-600">Connected</span>
                                                        </>
                                                    )}
                                                    <span className="text-sm text-gray-500">
                                                        {integration.description}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {integration.action === "manage" ? (
                                                <Button variant="outline" size="sm">
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Manage
                                                </Button>
                                            ) : (
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Connect
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
