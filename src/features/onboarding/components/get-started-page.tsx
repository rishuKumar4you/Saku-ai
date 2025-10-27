"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function GetStartedPage() {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto text-center px-6">
                {/* Logo */}
                <div className="mb-8">
                    <div className="w-20 h-20 mx-auto flex items-center justify-center">
                        <Image src="/logos/logo.svg" alt="Saku AI" width={80} height={80} />
                    </div>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Meet Saku AI
                </h1>

                {/* Description */}
                <p className="text-lg text-gray-600 mb-8">
                    Your proactive AI assistant that works seamlessly across all your apps and workflows.
                </p>

                {/* Get Started Button */}
                <Button
                    onClick={handleGetStarted}
                    className="bg-black text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    Get Started
                </Button>
            </div>
        </div>
    );
}
