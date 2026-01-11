import { prisma } from "../config/prisma.config";
import { CartEventType } from "../generated/prisma";
import { PrismaTx } from "../types/prisma.types";

export interface CreateCartEventDTO {
    customerId: string;
    eventType: CartEventType;
    menuItemId?: string;
    itemName?: string;
    quantity?: number;
    price?: number;
}

class CartEventRepository {
    async createEvent(data: CreateCartEventDTO, tx: PrismaTx = prisma) {
        return await tx.cartEvent.create({
            data: {
                customerId: data.customerId,
                eventType: data.eventType,
                menuItemId: data.menuItemId ?? null,
                itemName: data.itemName ?? null,
                quantity: data.quantity ?? null,
                price: data.price ?? null,
            },
        });
    }
}

export const cartEventRepository = new CartEventRepository();
