import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../types/OrderContext";
import { cartRepository } from "../repositories/cart.repository";

/**
 * Clears the customer's cart after successful payment.
 */
export class ClearCartHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.shouldClearCart) {
            console.log(`[ClearCartHandler] Skipping cart clearing (payment failed)`);
            return;
        }

        console.log(`[ClearCartHandler] Clearing cart`);

        await cartRepository.clearCartByCustomerId(context.customerId);

        console.log(`[ClearCartHandler] Cart cleared successfully`);
    }
}
