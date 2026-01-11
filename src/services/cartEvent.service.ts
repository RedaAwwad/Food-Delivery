import { cartEventRepository, CreateCartEventDTO } from "../repositories/cartEvent.repository";
import { PrismaTx } from "../types/prisma.types";

class CartEventService {
    async createEvent(data: CreateCartEventDTO, tx?: PrismaTx) {
        return await cartEventRepository.createEvent(data, tx);
    }
}

export const cartEventService = new CartEventService();
