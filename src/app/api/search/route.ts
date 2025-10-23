import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const formData = await request.formData();
    const resp = await fetch(`${backend.replace(/\/$/, "")}/search`, {
      method: "POST",
      body: formData,
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

