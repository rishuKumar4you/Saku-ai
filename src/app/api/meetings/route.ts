import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

export async function GET() {
  try {
    const resp = await fetch(`${backendBase}/meetings`, { cache: "no-store" });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const resp = await fetch(`${backendBase}/meetings`, { method: "POST", body: form });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 502 });
  }
}

