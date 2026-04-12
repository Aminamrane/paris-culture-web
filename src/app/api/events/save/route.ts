import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { externalId, eventData } = body;
  if (!externalId) return NextResponse.json({ error: "externalId required" }, { status: 400 });

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;
    await p.savedEvent.upsert({
      where: { userId_externalId: { userId: session.user.id, externalId } },
      create: { userId: session.user.id, externalId, eventData },
      update: { eventData },
    });

    // Log activity
    await p.activityLog.create({
      data: {
        userId: session.user.id,
        type: "SAVED_EVENT",
        entityId: externalId,
        entityType: "event",
        entityData: eventData,
      },
    });

    return NextResponse.json({ saved: true });
  } catch {
    // DB not available — client uses localStorage
    return NextResponse.json({ saved: true, local: true });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { externalId } = body;
  if (!externalId) return NextResponse.json({ error: "externalId required" }, { status: 400 });

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).savedEvent.deleteMany({
      where: { userId: session.user.id, externalId },
    });

    return NextResponse.json({ saved: false });
  } catch {
    return NextResponse.json({ saved: false, local: true });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ items: [] });

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await (prisma as any).savedEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
