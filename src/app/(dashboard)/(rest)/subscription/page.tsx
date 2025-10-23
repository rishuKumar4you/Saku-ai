"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import {toast} from "sonner"
import { Button } from "@/components/ui/button";
const Page = () => {
    const trpc = useTRPC();
    const testAI = useMutation(trpc.testAi.mutationOptions({
        onSuccess: () => {
            toast.success("success");
        },
        onError: ({ message }) => {
            toast.error(message);
        },
    }));
    

return (
    <Button onClick={() => testAI.mutate()}>
        Click to test subscriptions
        </Button>
    )
}

export default Page;

