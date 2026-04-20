import { CartEventType } from "../generated/prisma/client";

export interface CartEventDTO {
    eventType: CartEventType;
    menuItemId?: string;
    quantity?: number;
}
