import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const formData = await request.formData();
    const resp = await fetch(`${backend.replace(/\/$/, "")}/ingest/upload`, {
      method: "POST",
      body: formData,
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

