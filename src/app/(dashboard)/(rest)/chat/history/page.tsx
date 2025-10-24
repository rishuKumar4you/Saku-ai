import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

async function fetchConversations() {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  const url = base ? `${base.replace(/\/$/, "")}/api/conversations` : `http://localhost:3000/api/conversations`;
  const resp = await fetch(url, { cache: "no-store" });
  const data = await resp.json().catch(() => ({ conversations: [] }));
  return Array.isArray(data?.conversations) ? data.conversations : [];
}

const Page = async () => {
  await requireAuth();
  const conversations = await fetchConversations();

  const getDisplayTitle = (conv: any) => {
    if (conv.title && conv.title.trim()) {
      return conv.title;
    }
    // If no title, show "New Chat" with date
    const date = new Date(conv.createdAt || conv.updatedAt);
    return `New Chat - ${date.toLocaleDateString()}`;
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-lg font-semibold">Chat History</h1>
      <div className="space-y-2">
        {conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          conversations.map((c: any) => (
            <a key={c.id} href={`/chat?convId=${c.id}`} className="block p-3 border rounded hover:bg-muted/50 transition-colors">
              <div className="text-sm font-medium">{getDisplayTitle(c)}</div>
              <div className="text-xs text-muted-foreground">
                {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : 
                 c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;


