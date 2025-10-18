import { PrismaClient } from "../generated/prisma";

export const prisma = new PrismaClient({
  log: ["info", "query", "warn", "error"],
});

