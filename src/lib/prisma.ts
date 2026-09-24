import { PrismaClient } from "@prisma/client";

const defaultDbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.avuxzazbodiuwhdsjdhm:Furkan159.%21@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
