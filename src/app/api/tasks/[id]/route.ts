import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.formData();
    const resp = await fetch(`${backendBase}/tasks/${id}`, {
      method: "PUT",
      body,
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const resp = await fetch(`${backendBase}/tasks/${id}`, { method: "DELETE" });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "request_failed" }, { status: 500 });
  }
}

