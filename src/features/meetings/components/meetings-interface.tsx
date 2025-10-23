"use client";

import { useState } from "react";
import { MeetingsHeader } from "./meetings-header";
import { MeetingsContent } from "./meetings-content";

export const MeetingsInterface = () => {
    const [activeTab, setActiveTab] = useState<"my-meetings" | "shared-with-me" | "incomplete">("my-meetings");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="flex flex-col h-full bg-background">
            <MeetingsHeader 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />
            <MeetingsContent 
                activeTab={activeTab}
                searchQuery={searchQuery}
            />
        </div>
    );
};
