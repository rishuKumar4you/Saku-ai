import { requireAuth } from "@/lib/auth-utils";
import { TagsInterface } from "@/features/settings/components/tags-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <TagsInterface />
        </div>
    );
};

export default Page;
