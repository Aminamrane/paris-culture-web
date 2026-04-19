import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST — mark an event as visited (diary entry)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const {
    externalId, eventTitle, eventCover, eventVenue, eventDate,
    visitedOn, note, action,
  } = await req.json();

  if (!externalId) {
    return NextResponse.json({ error: "externalId required" }, { status: 400 });
  }

  if (action === "remove") {
    await supabaseAdmin
      .from("visited_events")
      .delete()
      .eq("user_id", session.user.id)
      .eq("external_id", externalId);
    return NextResponse.json({ ok: true, visited: false });
  }

  const day = visitedOn || new Date().toISOString().slice(0, 10);

  const { error } = await supabaseAdmin
    .from("visited_events")
    .upsert(
      {
        user_id: session.user.id,
        external_id: externalId,
        event_title: eventTitle || null,
        event_cover: eventCover || null,
        event_venue: eventVenue || null,
        event_date: eventDate || null,
        visited_on: day,
        note: note || null,
      },
      { onConflict: "user_id,external_id" }
    );

  if (error) {
    console.error("Visit error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If a public note is attached, also write to event_notes for the comments feed
  if (note && note.trim().length > 0) {
    await supabaseAdmin.from("event_notes").insert({
      user_id: session.user.id,
      user_name: session.user.name || null,
      external_id: externalId,
      note: note.trim(),
    });
  }

  return NextResponse.json({ ok: true, visited: true });
}

// GET — list current user's visited (diary) or check single event
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ items: [], visited: false });
  }

  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get("externalId");

  if (externalId) {
    const { data } = await supabaseAdmin
      .from("visited_events")
      .select("id, visited_on, note")
      .eq("user_id", session.user.id)
      .eq("external_id", externalId)
      .maybeSingle();
    return NextResponse.json({
      visited: !!data,
      visitedOn: data?.visited_on || null,
      note: data?.note || null,
    });
  }

  const { data } = await supabaseAdmin
    .from("visited_events")
    .select("*")
    .eq("user_id", session.user.id)
    .order("visited_on", { ascending: false });

  return NextResponse.json({ items: data || [] });
}
