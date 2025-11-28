// import { CartItem, MenuItem } from "@prisma-client";
import { prisma } from "../config/prisma.config";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { CartItemWithMenuItem } from "../types/cartItemWithMenuItem.type";

// type CartItemWithMenuItem = CartItem & { menuItem: MenuItem };

class InventoryRepository {
    /**
     * Checks if all items in the cart are available in the required quantity.
     * Throws an error if any item is out of stock.
     */
    async checkItemsAvailability(items: CartItemWithMenuItem[]) {
        for (const item of items) {
            if (item.quantity > item.menuItem.stockQuantity) {
                throw new CustomError({
                    message: `Item '${item.menuItem.menuItemName}' is out of stock. Required: ${item.quantity}, Available: ${item.menuItem.stockQuantity}`,
                    statusCode: StatusCodes.CONFLICT, // 409 Conflict is appropriate here
                });
            }
        }
    }

    /**
     * Reduces the stock for the given items. This should be called after a successful payment.
     * This operation is done in a transaction to ensure all stock updates succeed or none do.
     */
    async reduceStock(items: CartItemWithMenuItem[]) {
        const stockUpdates = items.map((item) => {
            return prisma.menuItem.update({
                where: { menuItemId: item.menuItemId },
                data: {
                    stockQuantity: {
                        decrement: item.quantity,
                    },
                },
            });
        });

        // Execute all updates in a single transaction
        await prisma.$transaction(stockUpdates);
    }
}

export const inventoryRepository = new InventoryRepository();
