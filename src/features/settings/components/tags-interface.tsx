"use client";

import { useState } from "react";
import { Plus, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AutoTag {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const autoTags: AutoTag[] = [
    { id: "1-1", name: "1:1", icon: "👤", color: "bg-purple-100 text-purple-800" },
    { id: "brainstorm", name: "Brainstorm", icon: "💡", color: "bg-yellow-100 text-yellow-800" },
    { id: "education", name: "Education", icon: "🎓", color: "bg-blue-100 text-blue-800" },
    { id: "external", name: "External", icon: "🔗", color: "bg-red-100 text-red-800" },
    { id: "planning", name: "Planning", icon: "📅", color: "bg-green-100 text-green-800" },
    { id: "status-review", name: "Status / Review", icon: "✅", color: "bg-orange-100 text-orange-800" },
    { id: "team", name: "Team", icon: "👥", color: "bg-purple-100 text-purple-800" },
    { id: "upload", name: "Upload", icon: "📤", color: "bg-blue-100 text-blue-800" },
];

export const TagsInterface = () => {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
                <p className="text-gray-600 mt-2">
                    Manage custom tags and auto-tagging to better organize and categorize your meetings.
                </p>
            </div>

            <div className="space-y-8">
                {/* Custom Tags Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Custom Tags</h2>
                        <p className="text-gray-600 mt-1">
                            Create and delete custom tags. Deleting tags will remove them from any meetings to which they are applied.
                        </p>
                    </div>
                    
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add new tag
                    </Button>
                </div>

                {/* Auto Tags Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Auto Tags</h2>
                        <p className="text-gray-600 mt-1">
                            Read automatically assigns these tags to your meetings based on the content and context.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {autoTags.map((tag) => (
                            <div
                                key={tag.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">{tag.icon}</span>
                                    <Badge variant="secondary" className={tag.color}>
                                        {tag.name}
                                    </Badge>
                                </div>
                                <Eye className="w-4 h-4 text-gray-400" />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs">i</span>
                        </div>
                        <span>Tags are automatically applied based on meeting content and participant behavior</span>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="flex justify-end">
                    <Button variant="link" className="text-blue-600 hover:text-blue-700">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn more about tags
                    </Button>
                </div>
            </div>
        </div>
    );
};
