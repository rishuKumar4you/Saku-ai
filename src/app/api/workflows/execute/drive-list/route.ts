import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults = 10 } = await req.json();
    
    const backendUrl = process.env.MAIN_BACKEND_URL || "http://localhost:8080";
    
    const url = new URL(`${backendUrl}/integrations/drive/files`);
    url.searchParams.set("max_results", maxResults.toString());
    if (query) {
      url.searchParams.set("query", query);
    }
    
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch Drive files");
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to list Drive files" },
      { status: 500 }
    );
  }
}

