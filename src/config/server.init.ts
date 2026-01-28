import { Express } from "express";
import { prisma } from "../config/prisma.config";

const initServer = async (app: Express) => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    const server = app.listen(Number(process.env.PORT), () => {
      console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
      console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("🛑 Shutting down server...");
      server.close(() => {
        console.log("HTTTP server closed.");
      });
      await prisma.$disconnect();
      console.log("Database disconnected.");
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

export { initServer };
