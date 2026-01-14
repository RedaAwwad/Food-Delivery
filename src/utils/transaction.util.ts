import { prisma } from "../config/prisma.config";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "../generated/prisma";

type TxClient = PrismaTx | PrismaClient;

export async function withTransaction<T>(
    externalTx: TxClient | undefined,
    callback: (tx: TxClient) => Promise<T>
): Promise<T> {
    if (externalTx) {
        return await callback(externalTx);
    }

    return await prisma.$transaction(async (newTx) => {
        return await callback(newTx);
    });
}
