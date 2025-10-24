import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  try {
    const body = await request.json();
    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/integrations/disconnect`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}


