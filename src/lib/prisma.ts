// Prisma client - will be configured when database is ready
// For now, export a mock to prevent build errors

let prisma: unknown = null;

try {
  // Only import if DATABASE_URL is configured and not a placeholder
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("user:password")) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    const globalForPrisma = globalThis as unknown as { prisma: unknown };
    prisma = globalForPrisma.prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  }
} catch {
  // Prisma not available
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export { prisma as prisma };
