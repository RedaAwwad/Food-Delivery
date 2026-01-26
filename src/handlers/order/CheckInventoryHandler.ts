import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { InternalServerError } from "../../utils/errors";
import { menuItemService } from "../../services/menuItem.service";

/**
 * Verifies that all items in the cart are available in sufficient quantities.
 */
export class CheckInventoryHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[CheckInventoryHandler] Checking inventory availability`);

        if (!context.cartItems) {
            throw InternalServerError("Cart items not found in context (CheckInventory)");
        }

        await menuItemService.validateStock(context.cartItems, context.tx);

        console.log(`[CheckInventoryHandler] Inventory check passed`);
    }
}
