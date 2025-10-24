"use client";

import { useState } from "react";
import { ExternalLink, LogOut, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
    id: string;
    device: string;
    location: string;
    status: "current" | "active";
    lastActive: string;
}

const sessions: Session[] = [
    {
        id: "1",
        device: "Chrome Browser (Current)",
        location: "Dhaka, Dhaka Division",
        status: "current",
        lastActive: "Active just now",
    },
    {
        id: "2",
        device: "Chrome Browser",
        location: "Dhaka, Dhaka Division",
        status: "active",
        lastActive: "Active 15 hours ago",
    },
    {
        id: "3",
        device: "Chrome Browser",
        location: "Dhaka, Dhaka Division",
        status: "active",
        lastActive: "Active 9 days ago",
    },
];

export const AdvancedInterface = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleLogoutAll = () => {
        // Handle logout all sessions
        console.log("Logout all sessions");
    };

    const handleLogoutSession = (sessionId: string) => {
        // Handle logout specific session
        console.log("Logout session:", sessionId);
    };

    const handleDeleteAccount = () => {
        setIsDeleting(true);
        // Handle account deletion
        console.log("Delete account");
    };

    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Advanced</h1>
                <p className="text-gray-600 mt-2">
                    Manage additional controls for your account, security, and preferences.
                </p>
            </div>

            <div className="space-y-8">
                {/* Active Sessions Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                Active Sessions
                                <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                            </h2>
                            <p className="text-gray-600 mt-1">
                                See where your account is signed in and log out of individual or all sessions to keep your account secure.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${
                                        session.status === "current" ? "bg-green-500" : "bg-gray-400"
                                    }`}></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{session.device}</p>
                                        <p className="text-sm text-gray-500">
                                            {session.location} • {session.lastActive}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLogoutSession(session.id)}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log out
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleLogoutAll}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Log out of all sessions
                    </Button>
                </div>

                {/* Delete Account Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                Delete Account
                                <ExternalLink className="w-4 h-4 ml-2 text-gray-400" />
                            </h2>
                            <p className="text-gray-600 mt-1">
                                This action is permanent and cannot be undone.
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete my account"}
                    </Button>
                </div>
            </div>
        </div>
    );
};
