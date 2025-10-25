import { NextRequest, NextResponse } from "next/server";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt") || "";
  const docIds = searchParams.get("docIds") || "";
  const convId = searchParams.get("convId") || "";

  // Default backend URL if not set in environment
  const backend =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  try {
    // Proxy to FastAPI backend SSE
    const qp = new URLSearchParams({ prompt });
    if (docIds) qp.set("docIds", docIds);
    if (convId) qp.set("convId", convId);
    const target = `${backend.replace(/\/$/, "")}/chat/stream?${qp.toString()}`;
    console.log(`Proxying to backend: ${target}`);

    const resp = await fetch(target, {
      headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" },
    });

    if (!resp.ok) {
      console.error(`Backend error: ${resp.status} ${resp.statusText}`);
      throw new Error(`Backend responded with ${resp.status}`);
    }

    if (!resp.body) {
      console.error("No response body from backend");
      return new NextResponse("Backend returned no data", { status: 502 });
    }

    return new NextResponse(resp.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Error connecting to backend:", error);
    // Fall back to mock response if backend is not available
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        controller.enqueue(
          encoder.encode(`data: {"type":"meta","prompt":${JSON.stringify(prompt)}}\n\n`)
        );
        await sleep(200);

        const tokens = [
          "I",
          " apologize",
          ",",
          " but",
          " the",
          " backend",
          " service",
          " is",
          " currently",
          " unavailable",
          ".",
          " Please",
          " ensure",
          " the",
          " Python",
          " backend",
          " is",
          " running",
          " at",
          " ",
          backend,
          ".",
        ];

        for (const token of tokens) {
          controller.enqueue(
            encoder.encode(`data: {"type":"token","value":${JSON.stringify(token)}}\n\n`)
          );
          await sleep(50);
        }

        controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
        controller.close();
      } catch (err) {
        console.error("Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

