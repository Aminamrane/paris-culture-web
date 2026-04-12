import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { externalId, approved } = body;
  if (!externalId || approved === undefined) {
    return NextResponse.json({ error: "externalId and approved required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("event_curation")
    .upsert(
      { external_id: externalId, approved, curated_at: new Date().toISOString() },
      { onConflict: "external_id" }
    );

  if (error) {
    console.error("Supabase curation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const approvedFilter = searchParams.get("approved");

  let query = supabaseAdmin
    .from("event_curation")
    .select("external_id, approved, curated_at")
    .order("curated_at", { ascending: false });

  if (approvedFilter !== null) {
    query = query.eq("approved", approvedFilter === "true");
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ items: [] });
  }

  const items = (data || []).map((row) => ({
    externalId: row.external_id,
    approved: row.approved,
    curatedAt: row.curated_at,
  }));

  return NextResponse.json({ items });
}
