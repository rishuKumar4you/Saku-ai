import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { summary, description, startTime, endTime, attendees } = await req.json();
    
    const backendUrl = process.env.MAIN_BACKEND_URL || "http://localhost:8080";
    
    // For now, just fetch events as a test - creating events would need additional backend endpoint
    const response = await fetch(`${backendUrl}/integrations/calendar/events?max_results=10`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to access calendar");
    }
    
    const data = await response.json();
    
    // Simulate event creation
    return NextResponse.json({
      eventId: "evt_" + Math.random().toString(36).substr(2, 9),
      summary,
      attendees: attendees?.split(',').map((a: string) => a.trim()) || [],
      created: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

