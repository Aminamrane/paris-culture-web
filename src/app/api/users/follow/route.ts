import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId || targetUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;

    const existing = await p.userFollow.findUnique({
      where: { followerId_followingId: { followerId: session.user.id, followingId: targetUserId } },
    });

    if (existing) {
      await p.userFollow.delete({ where: { id: existing.id } });
      await p.activityLog.create({
        data: { userId: session.user.id, type: "UNFOLLOWED_USER", entityId: targetUserId, entityType: "user" },
      });
      return NextResponse.json({ following: false });
    } else {
      await p.userFollow.create({
        data: { followerId: session.user.id, followingId: targetUserId },
      });
      await p.activityLog.create({
        data: { userId: session.user.id, type: "FOLLOWED_USER", entityId: targetUserId, entityType: "user" },
      });
      return NextResponse.json({ following: true });
    }
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
