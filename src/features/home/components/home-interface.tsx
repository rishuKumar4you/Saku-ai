"use client";

import { useState } from "react";
import { HomeHeader } from "./home-header";
import { TasksSection } from "./tasks-section";
import { AISuggestionsSection } from "./ai-suggestions-section";
import { TodayScheduleSection } from "./today-schedule-section";
import { AITraceSection } from "./ai-trace-section";

export const HomeInterface = () => {
    const [activeTab, setActiveTab] = useState<"tasks" | "approvals">("tasks");

    return (
        <div className="flex flex-col h-full bg-background">
            <HomeHeader />
            <div className="flex-1 p-3 sm:p-6 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                        <TasksSection activeTab={activeTab} onTabChange={setActiveTab} />
                        <AISuggestionsSection />
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6">
                        <TodayScheduleSection />
                        <AITraceSection />
                    </div>
                </div>
            </div>
        </div>
    );
};
