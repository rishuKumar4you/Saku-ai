import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

export async function GET() {
  try {
    const resp = await fetch(`${backendBase}/tasks`, { cache: "no-store" });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "request_failed", tasks: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    const resp = await fetch(`${backendBase}/tasks`, {
      method: "POST",
      body,
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}

