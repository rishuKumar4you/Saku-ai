import { requireAuth } from "@/lib/auth-utils";
import { IntegrationsInterface } from "@/features/settings/components/integrations-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <IntegrationsInterface />
        </div>
    );
};

export default Page;
