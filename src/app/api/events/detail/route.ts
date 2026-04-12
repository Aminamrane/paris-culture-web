import { NextRequest, NextResponse } from "next/server";
import { fetchEventById } from "@/lib/paris-opendata";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  try {
    const event = await fetchEventById(id);
    return NextResponse.json({ event });
  } catch {
    return NextResponse.json({ event: null });
  }
}
