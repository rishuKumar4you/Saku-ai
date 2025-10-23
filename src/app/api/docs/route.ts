import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/documents`);
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching docs:", error);
    return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
  }
}

