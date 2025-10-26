"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function OnboardingPricingPage() {
    const router = useRouter();
    const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleNext = () => {
        router.push("/onboarding/connect-tools");
    };

    const handlePrevious = () => {
        router.push("/onboarding/features");
    };

    const handleProPlanPurchase = async () => {
        setIsProcessing(true);
        try {
            // Use the working Polar checkout implementation
            await authClient.checkout({ slug: "pro" });
        } catch (error) {
            console.error("Payment error:", error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Choose your plan
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                        Start a 3-day free trial. Cancel anytime.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-6 sm:mb-8">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setBillingPeriod("monthly")}
                                className={`px-4 sm:px-6 py-2 rounded-md transition-colors text-sm sm:text-base ${
                                    billingPeriod === "monthly"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-600"
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod("yearly")}
                                className={`px-4 sm:px-6 py-2 rounded-md transition-colors text-sm sm:text-base ${
                                    billingPeriod === "yearly"
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-600"
                                }`}
                            >
                                Yearly <span className="text-green-600 ml-1">(Save 20%)</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* Pro Plan */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 relative">
                        <div className="absolute top-4 right-4">
                            <div className="bg-purple-100 text-purple-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                                    <path d="M8 1L10.5 6.5L16 8L10.5 9.5L8 15L5.5 9.5L0 8L5.5 6.5L8 1Z" fill="currentColor"/>
                                </svg>
                                2 Months Free
                            </div>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                        <div className="mb-4">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">$40</span>
                            <span className="text-gray-600 text-sm sm:text-base">/mo</span>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm sm:text-base">Best for Power users, solo founders,</p>

                        <Button 
                            onClick={handleProPlanPurchase}
                            disabled={isProcessing}
                            className="w-full bg-black hover:bg-gray-800 text-white py-3 mb-6"
                        >
                            {isProcessing ? "Processing..." : "Start 3-Day Free Trial →"}
                        </Button>

                        <ul className="space-y-3 text-sm sm:text-base">
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Credit 50,000-100,000 / month
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Unlimited Workflow
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Always-on Monitoring
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Enhanced Trace (relationship maps + KPI tracking)
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Proactive Suggestions
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Unlimited History
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Every 1 min, priority execution scheduling
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Standard Support
                            </li>
                        </ul>
                    </div>

                    {/* Custom Plan */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Custom Plan</h3>
                        <div className="mb-4">
                            <span className="text-3xl sm:text-4xl font-bold text-gray-900">Custom</span>
                            <span className="text-gray-600 text-sm sm:text-base">/mo</span>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm sm:text-base">Best for Companies & Organizations</p>

                        <Button variant="outline" className="w-full py-3 mb-6">
                            Contact For Pricing →
                        </Button>

                        <ul className="space-y-3 text-sm sm:text-base">
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Custom Credits
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Unlimited Workflow
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Advanced monitoring
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Custom dashboards
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Proactive Suggestions
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Unlimited History
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Enterprise-level scheduling
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Dedicated onboarding & SLA
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                SSO, SOC2, GDPR Compliance and more
                            </li>
                            <li className="flex items-center">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-500 mr-3 flex-shrink-0">
                                    <path d="M16.5 5.5L7.5 14.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Custom API Integrations
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        className="px-4 sm:px-6 py-2"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="px-4 sm:px-6 py-2 bg-black hover:bg-gray-800"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
