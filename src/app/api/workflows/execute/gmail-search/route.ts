import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, maxResults = 10 } = await req.json();
    
    const backendUrl = process.env.MAIN_BACKEND_URL || "http://localhost:8080";
    const url = `${backendUrl}/integrations/gmail/messages?query=${encodeURIComponent(query || "is:unread")}&max_results=${maxResults}`;
    
    console.log("Gmail API Request:", { url, query, maxResults });
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("Gmail API Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gmail API error:", errorText);
      throw new Error(`Failed to fetch emails: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Gmail API data:", { messageCount: data.messages?.length || 0 });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gmail search error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search emails", messages: [] },
      { status: 500 }
    );
  }
}

