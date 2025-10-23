import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend)
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 }
    );

  try {
    // Fetch data from various Google integrations
    const [gmailResp, calendarResp, tasksResp] = await Promise.allSettled([
      fetch(`${backend.replace(/\/$/, "")}/integrations/gmail/messages?max_results=10`),
      fetch(`${backend.replace(/\/$/, "")}/integrations/calendar/events?max_results=10`),
      fetch(`${backend.replace(/\/$/, "")}/integrations/tasks`).catch(() => null),
    ]);

    const gmailMessages =
      gmailResp.status === "fulfilled" && gmailResp.value?.ok
        ? await gmailResp.value.json().then((d) => d.messages || [])
        : [];

    const calendarEvents =
      calendarResp.status === "fulfilled" && calendarResp.value?.ok
        ? await calendarResp.value.json().then((d) => d.events || [])
        : [];

    const tasks =
      tasksResp.status === "fulfilled" && tasksResp.value?.ok
        ? await tasksResp.value.json().then((d) => d.tasks || [])
        : [];

    return NextResponse.json({
      success: true,
      data: {
        gmailMessages,
        calendarEvents,
        tasks,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        data: {
          gmailMessages: [],
          calendarEvents: [],
          tasks: [],
        },
      },
      { status: 500 }
    );
  }
}

