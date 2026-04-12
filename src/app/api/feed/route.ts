import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const followingOf = searchParams.get("followingOf");
  const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

  try {
    const { prisma } = await import("@/lib/prisma");
    if (!prisma) throw new Error("No DB");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = prisma as any;

    let userIds: string[] | undefined;

    if (followingOf) {
      // Get IDs of users that followingOf is following
      const follows = await p.userFollow.findMany({
        where: { followerId: followingOf },
        select: { followingId: true },
      });
      userIds = follows.map((f: { followingId: string }) => f.followingId);
      if (userIds && userIds.length === 0) return NextResponse.json({ items: [] });
    } else if (userId) {
      userIds = [userId];
    }

    const logs = await p.activityLog.findMany({
      where: userIds ? { userId: { in: userIds } } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    const items = logs.map((log: {
      id: string;
      userId: string;
      type: string;
      entityId: string;
      entityType: string;
      entityData: unknown;
      createdAt: Date;
      user: { id: string; name: string | null; avatar: string | null };
    }) => ({
      id: log.id,
      userId: log.userId,
      userName: log.user.name,
      userAvatar: log.user.avatar,
      type: log.type,
      entityId: log.entityId,
      entityType: log.entityType,
      entityData: log.entityData,
      createdAt: log.createdAt.toISOString(),
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
