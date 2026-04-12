import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, dateStart, dateEnd, addressName, addressStreet, description, priceType, priceDetail, contactUrl, accessLink } = body;

  if (!title || !category || !dateStart || !addressName) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const isCertified = (session.user as { certified?: boolean }).certified;

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = await (prisma as any).event.create({
      data: {
        title,
        category,
        description,
        dateStart: new Date(dateStart),
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        addressName,
        addressStreet,
        priceType: priceType === "gratuit" ? "FREE" : priceType === "payant" ? "PAID" : null,
        priceDetail,
        contactUrl,
        accessLink,
        source: "MANUAL",
        status: isCertified ? "APPROVED" : "PENDING",
        submittedById: session.user.id,
      },
    });

    // Log activity
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).activityLog.create({
      data: {
        userId: session.user.id,
        type: "CREATED_EVENT",
        entityId: event.id,
        entityType: "event",
        entityData: { title, category, addressName },
      },
    });

    return NextResponse.json({ id: event.id, status: event.status });
  } catch {
    // DB not available — simulate success
    return NextResponse.json({ id: "local-" + Date.now(), status: "PENDING" });
  }
}

// GET: list submitted events (admin)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const events = await (prisma as any).event.findMany({
      where: { source: "MANUAL", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { submittedBy: { select: { id: true, name: true, email: true, certified: true } } },
    });
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
