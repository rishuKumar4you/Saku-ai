import { requireAuth } from "@/lib/auth-utils";
import { AdvancedInterface } from "@/features/settings/components/advanced-interface";

const Page = async () => {
    await requireAuth();
    
    return <AdvancedInterface />;
};

export default Page;
