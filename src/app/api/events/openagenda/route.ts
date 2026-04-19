import { NextResponse } from "next/server";
import { fetchParisOpenAgendaEvents, openAgendaEventToParisEvent } from "@/lib/openagenda";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await fetchParisOpenAgendaEvents(100);
    const normalized = events
      .map(openAgendaEventToParisEvent)
      .filter((e) => e.lat_lon !== null);
    return NextResponse.json({ events: normalized });
  } catch (err) {
    console.error("OpenAgenda API error:", err);
    return NextResponse.json({ events: [] });
  }
}
