import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeInterface } from "@/features/home/components/home-interface";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const Page = async () => {
    await requireAuth();
    
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-accent/20">
                <div className="flex flex-col h-full">
                    <HydrateClient>
                        <ErrorBoundary fallback={<p>Error loading home!</p>}>
                            <Suspense fallback={<p>Loading home...</p>}>
                                <HomeInterface />
                            </Suspense>
                        </ErrorBoundary>
                    </HydrateClient>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Page;
