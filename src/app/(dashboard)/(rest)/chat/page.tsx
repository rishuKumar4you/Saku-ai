import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChatInterface } from "@/features/chat/components/chat-interface";

const Page = async() => {
    await requireAuth();
    
    return (
        <div className="flex flex-col h-full">
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error!</p>}>
                    <Suspense fallback={<p>Loading...</p>}>
                        <ChatInterface />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </div>
    );
};

export default Page;
