import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const { id } = await params;
    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/meetings/${id}/transcribe`,
      { method: "POST" }
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error transcribing meeting:", error);
    return NextResponse.json(
      { error: "Failed to transcribe meeting" },
      { status: 500 }
    );
  }
}

