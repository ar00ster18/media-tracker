import { NextResponse } from "next/server";
import { WatchStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type ClientWatchStatus = "plan-to-watch" | "watching" | "watched";

type ListPayload = {
  catalogId?: unknown;
  status?: unknown;
};

const statusToDb: Record<ClientWatchStatus, WatchStatus> = {
  "plan-to-watch": WatchStatus.PLAN_TO_WATCH,
  watching: WatchStatus.WATCHING,
  watched: WatchStatus.WATCHED,
};

const statusFromDb: Record<WatchStatus, ClientWatchStatus> = {
  PLAN_TO_WATCH: "plan-to-watch",
  WATCHING: "watching",
  WATCHED: "watched",
};

function parseCatalogId(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function parseStatus(value: unknown): ClientWatchStatus | null {
  if (value === "plan-to-watch" || value === "watching" || value === "watched") {
    return value;
  }

  return null;
}

async function getAuthenticatedUserId(request: Request): Promise<string | null> {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.userListItem.findMany({
    where: { userId },
    select: { mediaId: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: items.map((item) => ({
      mediaId: item.mediaId,
      status: statusFromDb[item.status],
    })),
  });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ListPayload;
  const mediaId = parseCatalogId(body.catalogId);
  const status = body.status === undefined ? "plan-to-watch" : parseStatus(body.status);

  if (!mediaId || !status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.userListItem.upsert({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
    update: { status: statusToDb[status] },
    create: {
      userId,
      mediaId,
      status: statusToDb[status],
    },
    select: {
      mediaId: true,
      status: true,
    },
  });

  return NextResponse.json(
    {
      item: {
        mediaId: item.mediaId,
        status: statusFromDb[item.status],
      },
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ListPayload;
  const mediaId = parseCatalogId(body.catalogId);
  const status = parseStatus(body.status);

  if (!mediaId || !status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const item = await prisma.userListItem.update({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
    data: { status: statusToDb[status] },
    select: {
      mediaId: true,
      status: true,
    },
  }).catch(() => null);

  if (!item) {
    return NextResponse.json({ error: "List item not found" }, { status: 404 });
  }

  return NextResponse.json({
    item: {
      mediaId: item.mediaId,
      status: statusFromDb[item.status],
    },
  });
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as ListPayload;
  const mediaId = parseCatalogId(body.catalogId);

  if (!mediaId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.userListItem.delete({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
  }).catch(() => null);

  return new Response(null, { status: 204 });
}
