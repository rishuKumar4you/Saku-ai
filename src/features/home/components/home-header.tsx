"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const HomeHeader = () => {
    const trpc = useTRPC();
    const { data: profile } = useQuery(trpc.userSettings.getProfile.queryOptions());

    const getFirstName = () => {
        if (!profile?.name) return "User";
        const nameParts = profile.name.split(" ");
        return nameParts[0] || "User";
    };

    const getInitials = () => {
        if (!profile?.name) return "U";
        const nameParts = profile.name.split(" ");
        return nameParts.map(part => part.charAt(0)).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex-1 max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Hello, {getFirstName()}
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search Gmail, Slack, Docs & Web"
                            className="pl-10 h-12 text-base"
                        />
                    </div>
                </div>
                
                <div className="flex items-center ml-6">
                    {/* User Avatar */}
                    <Avatar className="w-8 h-8">
                        {profile?.image && profile.image.trim() !== "" ? (
                            <AvatarImage src={profile.image} alt={profile.name || "User"} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                            {getInitials()}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
};
