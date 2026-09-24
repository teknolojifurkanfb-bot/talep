import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Vercel Serverless environment: /tmp is the only writable folder
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    try {
      const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        }
      }
    } catch (err) {
      console.error("[Prisma Setup Error]:", err);
    }
    return `file:${tmpDbPath}`;
  }

  return process.env.DATABASE_URL || `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

const dbUrl = getDatabaseUrl();
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
