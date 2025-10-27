"use client";

import {
    CreditCardIcon,
    FolderOpenIcon,
    HistoryIcon,
    LogOutIcon,
    StarIcon,
    HomeIcon,
    MessageCircleIcon,
    UsersIcon,
    BarChart3Icon,
    SettingsIcon,
    WorkflowIcon,
} from "lucide-react";
import Image from "next/image";     
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscriptions";
import { UserProfile } from "@/components/user-profile";
import { ChatsDropdown } from "@/features/chat/components/chats-dropdown";

const menuItems = [
    {
        title: "Main",
        items: [
            {
                title: "Home",
                url: "/",
                icon: HomeIcon,
            },
            {
                title: "New Chat",
                url: "/chat",
                icon: MessageCircleIcon,
            },
            {
                title: "Workflows",
                url: "/workflows",
                icon: WorkflowIcon,
            },
            {
                title: "Meetings",
                url: "/meetings",
                icon: UsersIcon,
            },
            {
                title: "Insights",
                url: "/insights",
                icon: BarChart3Icon,
            },
            {
                title: "Documents",
                url: "/docs",
                icon: FolderOpenIcon,
            },
            {
                title: "Settings",
                url: "/settings",
                icon: SettingsIcon,
            },
        ],
    },
    {
        title: "Management",
        items: [
            {
                title: "Executions",
                icon: HistoryIcon,
                url: "/executions",
            },
        ],
    },
]; 



export const AppSidebar = () => {

    const router = useRouter();
    const pathname = usePathname();
    const { hasActiveSubscription, isLoading } = useHasActiveSubscription();

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenuItem>
                    <div className="flex items-center justify-between w-full px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
                        <SidebarMenuButton asChild className="gap-x-4 h-10 px-0 group-data-[collapsible=icon]:hidden">
                            <Link href="/" prefetch>
                                <Image
                                    src="/logos/logo.svg" alt="Saku AI" width={30} height={30} />
                                <span className="font-semibold text-sm">Saku AI</span>
                            </Link>
                        </SidebarMenuButton>
                        {/* Collapsed state logo - only visible when sidebar is collapsed */}
                        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
                            <Link href="/" prefetch>
                                <Image
                                    src="/logos/logo.svg" 
                                    alt="Saku AI" 
                                    width={24} 
                                    height={24} 
                                    className="transition-all"
                                />
                            </Link>
                        </div>
                        <SidebarTrigger />
                    </div>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem
                                    key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={item.url === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(item.url)
                                        }
                                        asChild
                                        className={`gap-x-4 h-10 px-4`}>
                                    <Link href={item.url} prefetch>
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
                
                {/* Chats Dropdown - always visible at the bottom */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <ChatsDropdown />
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {/* User Profile */}
                    <SidebarMenuItem>
                        <UserProfile />
                    </SidebarMenuItem>
                    
                    {!hasActiveSubscription && !isLoading && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Upgrade to Pro"
                                className="gap-x-4 h-10 px-4"
                                onClick={() => authClient.checkout({ slug: "basic" })}
                            >
                                <StarIcon className="h-4 w-4" />
                                <span>Upgrade to Pro</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Billing Portal"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => authClient.customer.portal()}>
                            <CreditCardIcon className="h-4 w-4" />
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Sign Out"
                            className="gap-x-4 h-10 px-4"
                            onClick={() => authClient.signOut({
                                fetchOptions: {
                                onSuccess: () => {
                                    router.push("/login");
                                },
                                }
                            })}
                            >
                            <LogOutIcon className="h-4 w-4" />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
        </Sidebar>
    );
};