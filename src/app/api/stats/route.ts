import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { WatchStatus } from "@prisma/client";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const watchLogs = await prisma.watchLog.findMany({
      where: { userId: session.user.id },
      include: { mediaItem: { select: { type: true, genres: true } } },
      orderBy: { watchedAt: "desc" },
    });

    const byStatus = {
      planToWatch: watchLogs.filter((l) => l.status === WatchStatus.PLAN_TO_WATCH).length,
      watching: watchLogs.filter((l) => l.status === WatchStatus.WATCHING).length,
      watched: watchLogs.filter((l) => l.status === WatchStatus.WATCHED).length,
    };

    const byType = {
      movies: watchLogs.filter((l) => l.mediaItem.type === "movie").length,
      tvShows: watchLogs.filter((l) => l.mediaItem.type === "tv").length,
    };

    const genreCounts: Record<string, number> = {};
    for (const log of watchLogs) {
      for (const genre of log.mediaItem.genres) {
        genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
      }
    }
    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([genre, count]) => ({ genre, count }));

    const now = new Date();
    const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        count: 0,
      };
    });

    for (const log of watchLogs) {
      const d = new Date(log.watchedAt);
      const entry = monthlyActivity.find(
        (m) => m.year === d.getFullYear() && m.month === d.getMonth()
      );
      if (entry) entry.count++;
    }

    const ratedLogs = watchLogs.filter((l) => l.rating !== null);
    const averageRating =
      ratedLogs.length > 0
        ? Math.round(
            (ratedLogs.reduce((sum, l) => sum + (l.rating ?? 0), 0) / ratedLogs.length) * 10
          ) / 10
        : null;

    return NextResponse.json({
      totalTracked: watchLogs.length,
      byStatus,
      byType,
      topGenres,
      monthlyActivity: monthlyActivity.map(({ label, count }) => ({ month: label, count })),
      averageRating,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
