import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// 1. Conditionally set the WebSocket constructor for local Node.js environments
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const adapter = new PrismaNeon({   connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;