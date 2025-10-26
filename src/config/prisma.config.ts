import { PrismaClient } from "../generated/prisma";

class PrismaSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient({
        log: ["info", "query", "warn", "error"],
      });
    }
    return PrismaSingleton.instance;
  }
}

export const prisma = PrismaSingleton.getInstance();

// export const prisma = new PrismaClient({
//   log: ["info", "query", "warn", "error"],
// });
