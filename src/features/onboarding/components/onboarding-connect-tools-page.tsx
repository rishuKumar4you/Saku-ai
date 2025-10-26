"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CredentialType } from "@/generated/prisma";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Tool {
    id: string;
    name: string;
    logo: React.ReactNode;
    credentialType?: CredentialType;
    oauthUrl?: string;
    connected?: boolean;
}

const tools: Tool[] = [
    {
        id: "gmail",
        name: "Gmail",
        logo: (
            <Image
                src="/gmail.svg"
                alt="Gmail"
                width={32}
                height={32}
                className="w-8 h-8"
            />
        ),
        credentialType: CredentialType.GMAIL_OAUTH,
        oauthUrl: "/api/connectors/gmail/auth-url"
    },
    {
        id: "slack",
        name: "Slack",
        logo: (
            <Image
                src="/slack.svg"
                alt="Slack"
                width={32}
                height={32}
                className="w-8 h-8"
            />
        ),
        connected: false
    },
    {
        id: "google-drive",
        name: "Google Drive",
        logo: (
            <Image
                src="/google-drive.svg"
                alt="Google Drive"
                width={32}
                height={32}
                className="w-8 h-8"
            />
        ),
        credentialType: CredentialType.GOOGLE_DRIVE_OAUTH,
        oauthUrl: "/api/connectors/google-drive/auth-url"
    },
    {
        id: "notion",
        name: "Notion",
        logo: (
            <Image
                src="/notion.svg"
                alt="Notion"
                width={32}
                height={32}
                className="w-8 h-8"
            />
        ),
        connected: false
    },
    {
        id: "google-calendar",
        name: "Google Calendar",
        logo: (
            <Image
                src="/google-calendar.svg"
                alt="Google Calendar"
                width={32}
                height={32}
                className="w-8 h-8"
            />
        ),
        credentialType: CredentialType.GOOGLE_CALENDAR_OAUTH,
        oauthUrl: "/api/connectors/google-calendar/auth-url"
    },
    {
        id: "discord",
        name: "Discord",
        logo: (
            <Image
                src="/discord.svg"
                alt="Discord"
                width={32}
                height={32}
                className="w-8 h-8"
            />
        ),
        connected: false
    }
];

export function OnboardingConnectToolsPage() {
    const router = useRouter();
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const [isConnecting, setIsConnecting] = useState<string | null>(null);

    const { data: credentials, isLoading } = useQuery(trpc.credentials.getAll.queryOptions());

    // Handle OAuth success/error messages
    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        
        if (success) {
            toast.success('Service connected successfully!');
            queryClient.invalidateQueries(trpc.credentials.getAll.queryOptions());
        } else if (error) {
            toast.error(`Connection failed: ${error}`);
        }
    }, [searchParams, queryClient, trpc.credentials.getAll]);

    const handleToolConnect = async (tool: Tool) => {
        if (tool.oauthUrl) {
            setIsConnecting(tool.id);
            try {
                // Use the exact same implementation as settings page
                const response = await fetch(tool.oauthUrl, { cache: "no-store" });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Connect failed:", errorText);
                    toast.error("Failed to start OAuth. Check backend URL and redirect URI.");
                    return;
                }
                const data = await response.json();
                if (data?.url) {
                    // Use assign to ensure same-tab navigation (same as settings)
                    window.location.assign(data.url as string);
                } else {
                    toast.error("OAuth URL not returned by backend.");
                }
            } catch (error) {
                console.error(`${tool.name} OAuth error:`, error);
                toast.error("Network error starting OAuth.");
                setIsConnecting(null);
            }
        }
    };

    const handleCompleteSetup = async () => {
        try {
            const response = await fetch("/api/onboarding/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                router.push("/");
            } else {
                console.error("Failed to complete onboarding");
                router.push("/");
            }
        } catch (error) {
            console.error("Error completing onboarding:", error);
            router.push("/");
        }
    };

    const handleSkip = async () => {
        try {
            const response = await fetch("/api/onboarding/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                router.push("/");
            } else {
                console.error("Failed to complete onboarding");
                router.push("/");
            }
        } catch (error) {
            console.error("Error completing onboarding:", error);
            router.push("/");
        }
    };

    const handlePrevious = () => {
        router.push("/onboarding/pricing");
    };

    const isToolConnected = (tool: Tool) => {
        if (!credentials || !tool.credentialType) return false;
        return credentials.some(cred => 
            cred.type === tool.credentialType && cred.isActive
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tools...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black mb-4">
                        Connect your tools
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Grant Saku AI access to your apps so it can help you search, summarize, and automate your work.
                    </p>
                </div>

                <div className="space-y-4 mb-6 sm:mb-8">
                    {tools.map((tool) => {
                        const isConnected = isToolConnected(tool);
                        const isConnectingThisTool = isConnecting === tool.id;
                        
                        return (
                            <div
                                key={tool.id}
                                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {tool.logo}
                                        <span className="font-medium text-gray-900">{tool.name}</span>
                                    </div>
                                    <Button
                                        variant={isConnected ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleToolConnect(tool)}
                                        disabled={isConnectingThisTool || !tool.oauthUrl}
                                        className={isConnected ? "bg-black hover:bg-gray-800 text-white" : ""}
                                    >
                                        {isConnectingThisTool 
                                            ? "Connecting..." 
                                            : isConnected 
                                                ? "Connected" 
                                                : tool.oauthUrl 
                                                    ? "Connect" 
                                                    : "Coming Soon"
                                        }
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleCompleteSetup}
                        className="w-full bg-black hover:bg-gray-800 text-white py-3"
                    >
                        Complete Setup
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="w-full py-3"
                    >
                        Skip For Now
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between mt-6 sm:mt-8">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        className="px-4 sm:px-6 py-2"
                    >
                        Previous
                    </Button>
                </div>
            </div>
        </div>
    );
}
