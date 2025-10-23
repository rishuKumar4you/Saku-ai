import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const formData = await request.formData();
    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/meetings/${params.id}/actions`,
      {
        method: "POST",
        body: formData,
      }
    );
    const json = await resp.json();
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error adding action:", error);
    return NextResponse.json({ error: "Failed to add action" }, { status: 500 });
  }
}

