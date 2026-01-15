import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { menuItemService } from "../../services/menuItem.service";

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
            throw new Error("Cart items not found in context");
        }

        await menuItemService.reduceStock(context.cartItems, context.tx);

        console.log(`[ReduceInventoryHandler] Inventory reduced successfully`);
    }
}
