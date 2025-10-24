import { requireAuth } from "@/lib/auth-utils";
import { MonitoringInterface } from "@/features/settings/components/monitoring-interface";

const Page = async () => {
    await requireAuth();
    
    return (
        <div className="p-8">
            <MonitoringInterface />
        </div>
    );
};

export default Page;
