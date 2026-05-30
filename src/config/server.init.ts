import { Express } from "express";
import { prisma } from "../config/prisma.config";

const initServer = async (app: Express) => {
  const port = Number(process.env.PORT) || 3000;
  const baseUrl = process.env.APP_BASE_URL || `http://localhost:${port}`;

  // Start listening first so the dashboard & API are reachable even if the
  // database is still warming up or temporarily unavailable.
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on ${baseUrl}`);
    console.log(`📊 Dashboard:  ${baseUrl}/dashboard`);
    console.log(`🛒 Shop:       ${baseUrl}/shop`);
    console.log(`✨ Landing:    ${baseUrl}/landing`);
    console.log(`📖 API docs:   ${baseUrl}/api-docs`);
  });

  // Connect to the database in the background (non-blocking).
  prisma
    .$connect()
    .then(() => console.log("✅ Database connected successfully"))
    .catch((error: unknown) => {
      console.warn(
        "⚠️  Database connection failed — API runs in degraded mode, dashboard still available.",
      );
      console.warn(error instanceof Error ? error.message : error);
    });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("🛑 Shutting down server...");
    server.close(() => {
      console.log("HTTP server closed.");
    });
    await prisma.$disconnect().catch(() => {});
    console.log("Database disconnected.");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

export { initServer };
