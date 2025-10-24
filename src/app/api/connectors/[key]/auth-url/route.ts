import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  const { key } = await params;
  try {
    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/connectors/${encodeURIComponent(key)}/auth-url`
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching auth url:", error);
    return NextResponse.json(
      { error: "Failed to fetch auth url" },
      { status: 500 }
    );
  }
}


