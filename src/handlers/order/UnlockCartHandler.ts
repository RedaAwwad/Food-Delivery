import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { cartService } from "../../services/cart.service";

/**
 * Unlocks the cart. This handler always executes, even if previous handlers failed.
 */
export class UnlockCartHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.isCartLocked) {
            console.log(`[UnlockCartHandler] Cart was not locked, skipping unlock`);
            return;
        }

        console.log(`[UnlockCartHandler] Unlocking cart`);

        try {
            await cartService.unlockCart(context.customerId);
            context.isCartLocked = false;
            console.log(`[UnlockCartHandler] Cart unlocked successfully`);
        } catch (error) {
            console.error(`[UnlockCartHandler] Failed to unlock cart:`, error);
            // Don't throw - we want to ensure this always completes
        }
    }
}
