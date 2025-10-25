import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData().catch(() => null);
    const resp = await fetch(`${backendBase}/integrations/zoom/import`, {
      method: "POST",
      body: body || undefined,
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}

