import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — stats for an event
//   public: saved_count, notes
//   admin only: visited_count
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get("externalId");
  if (!externalId) {
    return NextResponse.json({ error: "externalId required" }, { status: 400 });
  }

  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  // Saved count (public)
  const { count: savedCount } = await supabaseAdmin
    .from("saved_events")
    .select("*", { count: "exact", head: true })
    .eq("external_id", externalId);

  // A few avatars (public) — up to 3 most recent savers
  const { data: recentSavers } = await supabaseAdmin
    .from("saved_events")
    .select("user_id, saved_at")
    .eq("external_id", externalId)
    .order("saved_at", { ascending: false })
    .limit(3);

  // Notes (public) — with user name if available
  const { data: notes } = await supabaseAdmin
    .from("event_notes")
    .select("id, user_id, user_name, note, created_at")
    .eq("external_id", externalId)
    .order("created_at", { ascending: false })
    .limit(20);

  const response: Record<string, unknown> = {
    savedCount: savedCount || 0,
    recentSaverIds: (recentSavers || []).map((r) => r.user_id),
    notes: notes || [],
  };

  // Admin-only: visited count
  if (isAdmin) {
    const { count: visitedCount } = await supabaseAdmin
      .from("visited_events")
      .select("*", { count: "exact", head: true })
      .eq("external_id", externalId);
    response.visitedCount = visitedCount || 0;
  }

  return NextResponse.json(response);
}
