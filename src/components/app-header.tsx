"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export const AppHeader = () => {
    return (
        <header className="flex shrink-0 items-center h-14 px-4 border-b bg-background gap-2">
        <SidebarTrigger/>
        </header>
    );
};