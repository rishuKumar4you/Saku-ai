import { NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  try {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/integrations/status`, { cache: "no-store" });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}


