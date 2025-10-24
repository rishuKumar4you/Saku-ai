import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  try {
    // Build URLs
    const base = backend.replace(/\/$/, "");
    const nowIso = new Date().toISOString();
    const gmailUrl = `${base}/integrations/gmail/messages?max_results=15&query=${encodeURIComponent("is:unread newer_than:7d")}`;
    const calendarUrl = `${base}/integrations/calendar/events?max_results=25&time_min=${encodeURIComponent(nowIso)}`;
    const driveUrl = `${base}/integrations/drive/files?max_results=15`;

    // Fetch data from various Google integrations
    const [gmailResp, calendarResp, driveResp] = await Promise.allSettled([
      fetch(gmailUrl),
      fetch(calendarUrl),
      fetch(driveUrl),
    ]);

    const gmailMessages =
      gmailResp.status === "fulfilled" && gmailResp.value?.ok
        ? await gmailResp.value.json().then((d) => d.messages || [])
        : [];

    const calendarEvents =
      calendarResp.status === "fulfilled" && calendarResp.value?.ok
        ? await calendarResp.value.json().then((d) => d.events || [])
        : [];

    const driveFiles =
      driveResp.status === "fulfilled" && driveResp.value?.ok
        ? await driveResp.value.json().then((d) => d.files || [])
        : [];

    // Derive lightweight suggestions for the next 7 days
    const suggestions = [] as Array<{ id: string; title: string; description: string; priority: "high"|"medium"|"low"; actionText: string }>;

    try {
      const gm = Array.isArray(gmailMessages) ? gmailMessages.slice(0, 5) : [];
      for (const m of gm) {
        const subj = (m?.subject || "(No Subject)").toString();
        const from = (m?.sender || "").toString();
        suggestions.push({
          id: `gmail-${m?.id ?? Math.random()}`,
          title: `Reply to: ${subj}`,
          description: from ? `From ${from}` : "Unread email in the last 7 days",
          priority: "medium",
          actionText: "Reply",
        });
      }
    } catch {}

    try {
      const upcoming = Array.isArray(calendarEvents) ? calendarEvents.slice(0, 5) : [];
      for (const e of upcoming) {
        const title = (e?.summary || "Event").toString();
        const when = (e?.start?.dateTime || e?.start || "").toString();
        suggestions.push({
          id: `cal-${e?.id ?? Math.random()}`,
          title: `Upcoming: ${title}`,
          description: when ? `Starts ${when}` : "Calendar event in the next days",
          priority: "high",
          actionText: "Open Calendar",
        });
      }
    } catch {}

    try {
      const files = Array.isArray(driveFiles) ? driveFiles.slice(0, 5) : [];
      for (const f of files) {
        suggestions.push({
          id: `drv-${f?.id ?? Math.random()}`,
          title: `Review file: ${String(f?.name || "Untitled")}`,
          description: `${String(f?.mimeType || "")} • ${String(f?.modifiedTime || f?.createdTime || "")}`,
          priority: "low",
          actionText: "Open Drive",
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        gmailMessages,
        calendarEvents,
        driveFiles,
        suggestions,
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
          driveFiles: [],
          suggestions: [],
        },
      },
      { status: 500 }
    );
  }
}

