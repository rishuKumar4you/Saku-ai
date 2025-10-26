import { WorkflowsPageLayout } from "@/features/workflows/components/workflows-page-layout";
import { workflowParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
    searchParams: Promise<SearchParams>;
}

const Page = async({searchParams}: Props) => {
    await requireAuth();
    
    const params = await workflowParamsLoader(searchParams);
    prefetchWorkflows(params);
    
    return (
        <HydrateClient>
            <ErrorBoundary fallback={<div>Error loading workflows</div>}>
                <Suspense fallback={<div>Loading workflows...</div>}>
                    <WorkflowsPageLayout/>
                </Suspense>
            </ErrorBoundary>
        </HydrateClient>
    )
};

export default Page;