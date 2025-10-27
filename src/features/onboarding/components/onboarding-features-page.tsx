"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface Feature {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const features: Feature[] = [
    {
        id: "launcher",
        title: "Launcher",
        description: "Converse naturally and ask Saku to take actions.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" fill="currentColor"/>
            </svg>
        )
    },
    {
        id: "chat",
        title: "Chat",
        description: "Connect all chats & tools with integration",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C8.5 18 7.1 17.5 5.9 16.6L2 18L3.4 14.1C2.5 12.9 2 11.5 2 10Z" fill="currentColor"/>
            </svg>
        )
    },
    {
        id: "workflow",
        title: "Workflow automation",
        description: "Find anything across Gmail, Slack, Docs, Notion.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" fill="currentColor"/>
            </svg>
        )
    },
    {
        id: "integration",
        title: "Integration & Agent functionality",
        description: "Create workflows that run automatically.",
        icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12.5 7.5L18 10L12.5 12.5L10 18L7.5 12.5L2 10L7.5 7.5L10 2Z" fill="currentColor"/>
            </svg>
        )
    }
];

export function OnboardingFeaturesPage() {
    const router = useRouter();
    const [selectedFeature, setSelectedFeature] = useState("launcher");

    const handleNext = () => {
        router.push("/onboarding/pricing");
    };

    const handlePrevious = () => {
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Section */}
            <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Here&apos;s what Saku AI can Do for you!
                    </h1>

                    <div className="space-y-4 mb-8">
                        {features.map((feature) => (
                            <div
                                key={feature.id}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    selectedFeature === feature.id
                                        ? "border-black bg-gray-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => setSelectedFeature(feature.id)}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        selectedFeature === feature.id ? "bg-black text-white" : "bg-gray-200 text-gray-600"
                                    }`}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            className="px-6 py-2"
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="px-6 py-2 bg-black hover:bg-gray-800"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mb-8 inline-block">
                        <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                            <div className="w-20 h-20 flex items-center justify-center">
                                <Image src="/logos/logo.svg" alt="Saku AI" width={80} height={80} />
                            </div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-gray-900">Ensure Accuracy</h3>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-gray-900">Improve Readability</h3>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="font-semibold text-gray-900">Ask Your AI</h3>
                            <p className="text-sm text-gray-600 mt-1">Get interact With Chatgpt, Gemini & More</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
