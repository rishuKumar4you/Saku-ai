import { requireAuth } from "@/lib/auth-utils";
import { PoliciesInterface } from "@/features/settings/components/policies-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <PoliciesInterface />
        </div>
    );
};

export default Page;
