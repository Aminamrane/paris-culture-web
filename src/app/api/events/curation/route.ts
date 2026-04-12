import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { externalId, approved, eventData, source = "opendata" } = body;
  if (!externalId || approved === undefined) {
    return NextResponse.json({ error: "externalId and approved required" }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).eventCuration.upsert({
      where: { externalId },
      create: { externalId, approved, source, curatedBy: session.user.id, eventData },
      update: { approved, eventData },
    });

    return NextResponse.json({ ok: true });
  } catch {
    // DB not available — decisions are stored in localStorage on client
    return NextResponse.json({ ok: true, local: true });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const approved = searchParams.get("approved");

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await (prisma as any).eventCuration.findMany({
      where: approved !== null ? { approved: approved === "true" } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
