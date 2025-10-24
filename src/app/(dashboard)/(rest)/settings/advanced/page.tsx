import { requireAuth } from "@/lib/auth-utils";
import { AdvancedInterface } from "@/features/settings/components/advanced-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <AdvancedInterface />
        </div>
    );
};

export default Page;
