"use client";

import { CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BillingInterface = () => {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Payment & Billing</h1>
                <p className="text-gray-600 mt-2">
                    Manage your subscription, billing information, and payment methods.
                </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Billing Management
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Manage your subscription and billing through our secure payment portal.
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2" />
                        Manage Billing
                    </Button>
                </div>
            </div>
        </div>
    );
};
