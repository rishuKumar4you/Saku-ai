"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const UserProfile = () => {
    const trpc = useTRPC();
    const { data: profile, isLoading } = useQuery(trpc.userSettings.getProfile.queryOptions());

    if (isLoading) {
        return (
            <div className="flex items-center space-x-3 p-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const getInitials = () => {
        if (!profile.name) return "U";
        const nameParts = profile.name.split(" ");
        return nameParts.map(part => part.charAt(0)).join("").toUpperCase().slice(0, 2);
    };

    return (
        <Link 
            href="/settings/profile" 
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <Avatar className="w-8 h-8">
                {profile.image && profile.image.trim() !== "" ? (
                    <AvatarImage src={profile.image} alt={profile.name || "User"} />
                ) : null}
                <AvatarFallback className="text-xs">
                    {getInitials()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                    {profile.email}
                </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
    );
};
