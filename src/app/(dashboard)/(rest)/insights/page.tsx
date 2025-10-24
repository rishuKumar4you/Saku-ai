import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InsightsInterface } from "@/features/insights/components/insights-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="flex flex-col h-full">
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error loading insights!</p>}>
                    <Suspense fallback={<p>Loading insights...</p>}>
                        <InsightsInterface />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </div>
    );
};

export default Page;

