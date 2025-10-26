import { OnboardingConnectToolsPage } from "@/features/onboarding/components/onboarding-connect-tools-page";
import { Suspense } from "react";

export default function OnboardingConnectTools() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingConnectToolsPage />
        </Suspense>
    );
}
