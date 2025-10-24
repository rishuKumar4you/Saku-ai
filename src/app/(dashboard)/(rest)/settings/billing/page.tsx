import { requireAuth } from "@/lib/auth-utils";
import { BillingInterface } from "@/features/settings/components/billing-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <BillingInterface />
        </div>
    );
};

export default Page;
