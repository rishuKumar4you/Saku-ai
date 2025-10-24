import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ProfileAccountInterface } from "@/features/settings/components/profile-account-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <HydrateClient>
                <ErrorBoundary fallback={<p>Error loading profile!</p>}>
                    <Suspense fallback={<p>Loading profile...</p>}>
                        <ProfileAccountInterface />
                    </Suspense>
                </ErrorBoundary>
            </HydrateClient>
        </div>
    );
};

export default Page;
