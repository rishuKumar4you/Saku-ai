import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; actionId: string }> }) {
  const { id, actionId } = await params;
  try {
    const form = await request.formData();
    const resp = await fetch(`${backendBase}/meetings/${id}/actions/${actionId}/calendar`, { method: "POST", body: form });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "Failed to create calendar event" }, { status: 502 });
  }
}


