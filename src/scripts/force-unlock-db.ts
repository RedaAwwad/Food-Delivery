
import { prisma } from "../config/prisma.config";

async function forceUnlock() {
    console.log("Attempting to kill idle connections...");

    try {
        // This query terminates all OTHER connections to the database 'food_delivery' 
        // (or whatever DB name is in your env). 
        // Uses pg_terminate_backend.
        // NOTE: This requires the current user to have permission to kill other connections.

        // 1. Get current PID
        const result = await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE pid <> pg_backend_pid() 
      AND datname = current_database()
      AND state = 'idle';
    `;

        console.log("Kill command executed. Result:", result);
        console.log("Idle connections terminated. Locks should be released.");

    } catch (error) {
        console.error("Failed to kill connections:", error);
    } finally {
        await prisma.$disconnect();
    }
}

forceUnlock();
