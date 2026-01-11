import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { inventoryRepository } from "../../repositories/inventory.repository";

/**
 * Verifies that all items in the cart are available in sufficient quantities.
 */
export class CheckInventoryHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[CheckInventoryHandler] Checking inventory availability`);

        if (!context.cartItems) {
            throw new Error("Cart items not found in context");
        }

        await inventoryRepository.checkItemsAvailability(context.cartItems);

        console.log(`[CheckInventoryHandler] Inventory check passed`);
    }
}
