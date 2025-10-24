"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const settingsItems = [
    {
        title: "Profile & Account",
        href: "/settings/profile",
    },
    {
        title: "Integrations",
        href: "/settings/integrations",
    },
    {
        title: "Monitoring",
        href: "/settings/monitoring",
    },
    {
        title: "Notifications",
        href: "/settings/notifications",
    },
    {
        title: "Tags",
        href: "/settings/tags",
    },
    {
        title: "Payment & Billing",
        href: "/settings/billing",
        
    },
    {
        title: "Policies",
        href: "/settings/policies",
    },
    {
        title: "Advanced",
        href: "/settings/advanced",
    },
];

export const SettingsNavigation = () => {
    const pathname = usePathname();

    const handleBillingClick = async () => {
        try {
            await authClient.customer.portal();
        } catch (error) {
            console.error("Failed to open billing portal:", error);
        }
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Create workflow for making your work smoother
                </p>
            </div>
            
            <nav className="space-y-1">
                {settingsItems.map((item) => {
                    if (item.href === "/settings/billing") {
                        return (
                            <button
                                key={item.href}
                                onClick={handleBillingClick}
                                className={cn(
                                    "block w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    pathname === item.href
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {item.title}
                            </button>
                        );
                    }
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "block px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                pathname === item.href
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
