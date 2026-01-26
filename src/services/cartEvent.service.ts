import { cartEventRepository, CreateCartEventDTO } from "../repositories/cartEvent.repository";
import { PrismaTx } from "../types/prisma.types";

class CartEventService {
    async createEvent(data: CreateCartEventDTO, tx?: PrismaTx) {
        return await cartEventRepository.createEvent(data, tx);
    }

    async getEventsByCustomerId(customerId: string) {
        return await cartEventRepository.getEventsByCustomerId(customerId);
    }
}

export const cartEventService = new CartEventService();
