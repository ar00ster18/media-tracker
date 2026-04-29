import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { WatchStatus } from "@prisma/client";
import { fetchTMDB } from "@/lib/media";

interface ExternalRatingInput {
  source: string;
  value: string;
}

interface MediaItemInput {
  id: number;
  title: string;
  type: string;
  poster_path?: string | null;
  year?: string | number | null;
  ratings?: ExternalRatingInput[];
}

interface WatchlistPostRequest {
  mediaItem: MediaItemInput;
  status?: string;
  rating?: number | null;
  notes?: string | null;
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const watchLogs = await prisma.watchLog.findMany({
      where: { userId: session.user.id },
      include: {
        mediaItem: {
          include: {
            ratings: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Transform status to client-friendly format if needed, but our client already handles "plan-to-watch" etc.
    // Our DB has PLAN_TO_WATCH, WATCHING, WATCHED.
    const transformedLogs = watchLogs.map(log => ({
      ...log,
      status: log.status.toLowerCase().replace(/_/g, '-')
    }));

    return NextResponse.json(transformedLogs);
  } catch (error) {
    console.error("Failed to fetch watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as WatchlistPostRequest;
    const { mediaItem, status, rating, notes } = body;

    const parsedYear = typeof mediaItem.year === 'number' 
      ? mediaItem.year 
      : (mediaItem.year ? parseInt(String(mediaItem.year), 10) : null);

    // 1. Ensure MediaItem exists in our DB
    const mediaType = mediaItem.type.toLowerCase() === "movie" ? "movie" : "tv";

    let genres: string[] = [];
    try {
      const detail = await fetchTMDB<{ genres: { id: number; name: string }[] }>(`/${mediaType}/${mediaItem.id}`);
      genres = detail.genres.map((g) => g.name);
    } catch {
      // genres stays empty — non-fatal
    }

    const dbMedia = await prisma.mediaItem.upsert({
      where: { id: mediaItem.id },
      update: {
        title: mediaItem.title,
        type: mediaType,
        posterPath: mediaItem.poster_path,
        year: parsedYear,
        genres,
      },
      create: {
        id: mediaItem.id,
        title: mediaItem.title,
        type: mediaType,
        posterPath: mediaItem.poster_path,
        year: parsedYear,
        genres,
      }
    });

    // 2. Sync External Ratings if provided
    if (mediaItem.ratings && Array.isArray(mediaItem.ratings)) {
      for (const r of mediaItem.ratings) {
        await prisma.rating.upsert({
          where: {
            mediaId_source: {
              mediaId: dbMedia.id,
              source: r.source
            }
          },
          update: { value: r.value },
          create: {
            mediaId: dbMedia.id,
            source: r.source,
            value: r.value
          }
        });
      }
    }

    // 3. Create or Update WatchLog
    const statusMap: Record<string, WatchStatus> = {
      "plan-to-watch": WatchStatus.PLAN_TO_WATCH,
      "watching": WatchStatus.WATCHING,
      "watched": WatchStatus.WATCHED
    };
    
    const dbStatus = status && statusMap[status.toLowerCase()] ? statusMap[status.toLowerCase()] : WatchStatus.PLAN_TO_WATCH;

    const watchLog = await prisma.watchLog.upsert({
      where: {
        userId_mediaId: {
          userId: session.user.id,
          mediaId: dbMedia.id
        }
      },
      update: {
        status: dbStatus,
        rating: rating !== undefined ? rating : undefined,
        notes: notes || undefined,
      },
      create: {
        userId: session.user.id,
        mediaId: dbMedia.id,
        status: dbStatus,
        rating: rating !== undefined ? rating : null,
        notes: notes || null,
      }
    });

    return NextResponse.json(watchLog);
  } catch (error) {
    console.error("Failed to sync watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mediaId } = (await request.json()) as { mediaId: number };

    await prisma.watchLog.delete({
      where: {
        userId_mediaId: {
          userId: session.user.id,
          mediaId: mediaId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete from watchlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
