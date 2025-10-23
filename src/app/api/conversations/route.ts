import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  const form = new FormData();
  const body = await request.formData().catch(() => new FormData());
  const userId = String(body.get("userId") || "default");
  form.set("user_id", userId);

  try {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/conversations`, {
      method: "POST",
      body: form as any,
    });
    const json = await resp.json().catch(() => ({ ok: false }));
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/conversations`);
    const json = await resp.json().catch(() => ({ conversations: [] }));
    return NextResponse.json(json, { status: resp.status });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

