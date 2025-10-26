// import { PrismaClient } from "../generated/prisma";

// class PrismaSingleton {
//   private static instance: PrismaClient;

//   private constructor() {}

//   public static getInstance(): PrismaClient {
//     if (!PrismaSingleton.instance) {
//       PrismaSingleton.instance = new PrismaClient({
//         log: ["info", "query", "warn", "error"],
//       });
//     }
//     return PrismaSingleton.instance;
//   }
// }

// export const prisma = PrismaSingleton.getInstance();
// import { PrismaClient } from '@prisma/client';

import { PrismaClient } from "../generated/prisma";

export const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL successfully!');
  } catch (err:any) {
    console.error('❌ Connection failed:',err?.message );
  } finally {
    await prisma.$disconnect();
  }
})();
// export const prisma = new PrismaClient({
//   log: ["info", "query", "warn", "error"],
// });
