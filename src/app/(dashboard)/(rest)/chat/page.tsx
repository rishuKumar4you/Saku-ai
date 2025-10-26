import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChatInterface } from "@/features/chat/components/chat-interface";

const Page = async ({ searchParams }: { searchParams: Promise<{ convId?: string }> }) => {
    await requireAuth();
    
    const resolvedSearchParams = await searchParams;
    const convId = resolvedSearchParams?.convId || null;
    
    return (
        <div className="flex h-full">
            {/* Main Chat Area */}
            <div className="flex flex-col flex-1 min-w-0">
                <HydrateClient>
                    <ErrorBoundary fallback={<p>Error!</p>}>
                        <Suspense fallback={<p>Loading...</p>}>
                            <ChatInterface />
                        </Suspense>
                    </ErrorBoundary>
                </HydrateClient>
            </div>
        </div>
    );
};

export default Page;
