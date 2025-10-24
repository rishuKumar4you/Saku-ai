import { requireAuth } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

const Page = async () => {
    await requireAuth();
    redirect("/settings/profile");
};

export default Page;
