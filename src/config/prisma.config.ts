import { PrismaClient } from "../generated/prisma";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// (async () => {
//   try {
//     await prisma.$connect();
//     console.log("✅ Connected to PostgreSQL successfully!");
//   } catch (err: any) {
//     console.error("❌ Connection failed:", err?.message);
//   } finally {
//     await prisma.$disconnect();
//   }
// })();
// Connection management should be handled by the application lifecycle (e.g. initiateApp.ts)
