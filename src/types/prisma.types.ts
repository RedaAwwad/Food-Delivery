import { ExtendedTransactionClient } from "../config/prisma.config";

export type PrismaTx = Omit<ExtendedTransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;
