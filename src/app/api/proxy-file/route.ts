import { NextRequest } from "next/server";

const backendBase = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

export async function GET(req: NextRequest) {
  const objectUri = req.nextUrl.searchParams.get("objectUri") || "";
  const url = `${backendBase}/uploads/serve?objectUri=${encodeURIComponent(objectUri)}`;
  // Forward Range header so browsers can seek/stream video properly (Safari requires this)
  const range = req.headers.get("range") || undefined;
  const resp = await fetch(url, { headers: range ? { Range: range } : undefined });
  const headers = new Headers(resp.headers);
  headers.delete("content-encoding");
  return new Response(resp.body, { status: resp.status, headers });
}


