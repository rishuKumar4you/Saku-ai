import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const resp = await fetch(
      `${backend.replace(/\/$/, "")}/meetings/${params.id}/insights/run`,
      { method: "POST" }
    );
    const json = await resp.json().catch(() => ({ ok: false }));
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error running insights:", error);
    return NextResponse.json(
      { error: "Failed to run insights" },
      { status: 500 }
    );
  }
}

