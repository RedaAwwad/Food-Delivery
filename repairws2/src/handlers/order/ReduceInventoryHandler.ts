import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { menuItemService } from "../../services/menuItem.service";
import { InternalServerError } from "../../utils/errors";

/**
 * Reduces inventory stock if payment was successful.
 */
export class ReduceInventoryHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.shouldReduceInventory) {
            console.log(`[ReduceInventoryHandler] Skipping inventory reduction (payment failed)`);
            return;
        }

        console.log(`[ReduceInventoryHandler] Reducing inventory`);

        if (!context.cartItems) {
            throw InternalServerError("Cart items not found in context (ReduceInventory)");
        }

        await menuItemService.reduceStock(context.cartItems, context.tx);

        console.log(`[ReduceInventoryHandler] Inventory reduced successfully`);
    }
}
