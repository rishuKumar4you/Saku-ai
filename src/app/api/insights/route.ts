import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) {
        return NextResponse.json(
            { error: "Backend not configured" },
            { status: 500 }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range") || "weekly";

    try {
        const resp = await fetch(
            `${backend.replace(/\/$/, "")}/insights?range=${range}`,
            { cache: "no-store" }
        );
        const json = await resp.json();
        return NextResponse.json(json, { status: resp.status });
    } catch (error) {
        console.error("Error fetching insights:", error);
        return NextResponse.json(
            { error: "Failed to fetch insights" },
            { status: 500 }
        );
    }
}

