import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  try {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/connectors`, { cache: "no-store" });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching connectors:", error);
    return NextResponse.json(
      { error: "Failed to fetch connectors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  try {
    const body = await request.json();
    const resp = await fetch(`${backend.replace(/\/$/, "")}/connectors/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error toggling connector:", error);
    return NextResponse.json(
      { error: "Failed to toggle connector" },
      { status: 500 }
    );
  }
}

