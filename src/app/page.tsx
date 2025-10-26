import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { GetStartedPage } from "@/features/onboarding/components/get-started-page";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { HomeInterface } from "@/features/home/components/home-interface";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const Page = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    // If user is not authenticated, show Get Started page
    if (!session) {
        return <GetStartedPage />;
    }
    
    // Check if user has completed onboarding
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { onboardingCompleted: true }
    });
    
    if (!user?.onboardingCompleted) {
        redirect("/onboarding/features");
    }
    
    // If user is authenticated and has completed onboarding, show dashboard
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
