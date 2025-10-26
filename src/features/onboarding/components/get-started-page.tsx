"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
                    <div className="w-16 h-16 mx-auto bg-black rounded-lg flex items-center justify-center">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-white"
                        >
                            <path
                                d="M8 12L16 4L24 12L20 16L24 20L16 28L8 20L12 16L8 12Z"
                                fill="currentColor"
                            />
                        </svg>
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
