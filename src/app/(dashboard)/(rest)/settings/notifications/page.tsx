import { requireAuth } from "@/lib/auth-utils";
import { NotificationsInterface } from "@/features/settings/components/notifications-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <NotificationsInterface />
        </div>
    );
};

export default Page;
