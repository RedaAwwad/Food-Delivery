import { CartEventType } from "../generated/prisma";

export interface CartEventDTO {
    eventType: CartEventType;
    menuItemId?: string;
    quantity?: number;
}
