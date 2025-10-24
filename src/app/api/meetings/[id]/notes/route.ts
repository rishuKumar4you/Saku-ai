import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/$/, "");

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const form = await request.formData();
    const resp = await fetch(`${backendBase}/meetings/${id}/notes`, { method: "POST", body: form });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "Failed to add note" }, { status: 502 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const resp = await fetch(`${backendBase}/meetings/${id}/notes/${body.note_id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "Failed to edit note" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  try {
    const resp = await fetch(`${backendBase}/meetings/${id}/notes/${body.note_id}`, { method: "DELETE" });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch {
    return NextResponse.json({ error: "Failed to delete note" }, { status: 502 });
  }
}

