import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  const { searchParams } = new URL(request.url);
  const maxResults = searchParams.get("max_results") || "10";
  const query = searchParams.get("query") || "";

  try {
    const params = new URLSearchParams({ max_results: maxResults });
    if (query) params.set("query", query);

    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/integrations/gmail/messages?${params.toString()}`
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching Gmail messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch Gmail messages" },
      { status: 500 }
    );
  }
}

