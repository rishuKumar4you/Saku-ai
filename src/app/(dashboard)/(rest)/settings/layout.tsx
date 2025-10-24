import { requireAuth } from "@/lib/auth-utils";
import { SettingsNavigation } from "@/features/settings/components/settings-navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
    await requireAuth();
    
    return (
        <div className="flex h-full">
            <SettingsNavigation />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
};

export default Layout;
