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
  const timeMin = searchParams.get("time_min") || "";

  try {
    const params = new URLSearchParams({ max_results: maxResults });
    if (timeMin) params.set("time_min", timeMin);

    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/integrations/calendar/events?${params.toString()}`
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

