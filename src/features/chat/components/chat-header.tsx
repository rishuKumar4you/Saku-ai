"use client";

export const ChatHeader = () => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-6 py-3 sm:py-4 border-b bg-background">
            <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                    Chat With AI
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Break down lengthy texts into concise summaries to grasp.
                </p>
            </div>
        </div>
    );
};
