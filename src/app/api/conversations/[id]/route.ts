import { NextRequest, NextResponse } from "next/server";

export async function GET(
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
      `${backend.replace(/\/$/, "")}/conversations/${params.id}`
    );
    const json = await resp.json().catch(() => ({ ok: false }));
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      `${backend.replace(/\/$/, "")}/conversations/${params.id}`,
      { method: "DELETE" }
    );
    const json = await resp.json().catch(() => ({ ok: false }));
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}

