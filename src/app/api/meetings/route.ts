import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const orgId = searchParams.get("orgId") || "";

  try {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (orgId) params.set("orgId", orgId);

    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/meetings?${params.toString()}`
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const formData = await request.formData();
    const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings`, {
      method: "POST",
      body: formData,
    });
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}

