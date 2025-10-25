import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  try {
    const { prompt = "", docIds = "", convId = "" } = await request.json().catch(() => ({}));
    const qp = new URLSearchParams({ prompt });
    if (docIds) qp.set("docIds", String(docIds));
    if (convId) qp.set("convId", String(convId));

    const resp = await fetch(`${backend.replace(/\/$/, "")}/chat/stream?${qp.toString()}`, {
      headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" },
    });
    if (!resp.ok || !resp.body) {
      return NextResponse.json({ error: "backend_unavailable" }, { status: 502 });
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const event = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 2);
        const dataLine = event.split("\n").find(l => l.startsWith("data:"));
        if (!dataLine) continue;
        const payload = dataLine.slice(5).trim();
        try {
          const parsed = JSON.parse(payload);
          if (parsed?.type === "token") {
            finalText += String(parsed.value ?? "");
          } else if (parsed?.type === "done") {
            return NextResponse.json({ text: finalText.trim() || "" });
          }
        } catch {
          // ignore non-JSON lines
        }
      }
    }

    return NextResponse.json({ text: finalText.trim() || "" });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


