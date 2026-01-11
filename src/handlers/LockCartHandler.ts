import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../types/OrderContext";
import { cartService } from "../services/cart.service";

/**
 * Locks the customer's cart to prevent modifications during order processing.
 */
export class LockCartHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[LockCartHandler] Locking cart for customer: ${context.customerId}`);

        await cartService.lockCart(context.customerId);
        context.isCartLocked = true;

        console.log(`[LockCartHandler] Cart locked successfully`);
    }
}
