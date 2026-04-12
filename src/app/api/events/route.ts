import { NextRequest, NextResponse } from "next/server";
import {
  fetchParisOpenData,
  fetchUpcomingEventsWithGeo,
  searchEvents,
  fetchEventsByTag,
} from "@/lib/paris-opendata";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    let results;

    if (search) {
      results = await searchEvents(search, limit);
    } else if (category && category !== "all") {
      results = await fetchEventsByTag(category, limit);
    } else {
      results = await fetchUpcomingEventsWithGeo(limit);
    }

    console.log(`[API] Returning ${results.length} events`);
    return NextResponse.json({ events: results, total: results.length });
  } catch (error) {
    console.error("[API] Events error:", error);

    try {
      const data = await fetchParisOpenData({ limit, offset });
      console.log(`[API] Fallback: ${data.results.length} events`);
      return NextResponse.json({ events: data.results, total: data.total_count });
    } catch (e2) {
      console.error("[API] Fallback also failed:", e2);
      return NextResponse.json({ events: [], total: 0 });
    }
  }
}
