import Link from "next/link";

async function fetchDocs() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resp = await fetch(`${base.replace(/\/$/, "")}/api/docs`, { cache: "no-store" });
  const data = await resp.json().catch(() => ({ docs: [] }));
  return Array.isArray(data?.docs) ? data.docs : [];
}

const Page = async () => {
  const docs = await fetchDocs();
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <h1 className="text-lg font-semibold">Documents</h1>
      <div className="space-y-2">
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded.</p>
        ) : (
          docs.map((d: any) => (
            <div key={d.id} className="p-3 border rounded">
              <div className="text-sm font-medium">{d.title || d.id}</div>
              <div className="text-xs text-muted-foreground">{d.createdAt || ""}</div>
            </div>
          ))
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        <Link href="/chat" className="hover:underline">Back to chat →</Link>
      </div>
    </div>
  );
};

export default Page;


