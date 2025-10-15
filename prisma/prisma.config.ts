import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient({
  log: ["info", "query", "warn", "error"],
});

export { prisma };
