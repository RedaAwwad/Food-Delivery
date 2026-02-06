import { prisma } from "../config/prisma.config";
import { CartItemSummary } from "../types/CartItemSummary";
import { NotFoundError } from "../utils/errors";

class InventoryRepository {
    async checkItemsAvailability(items: CartItemSummary[]) {
        const menuItemIds = items.map((item) => item.menuItemId);

        const menuItems = await prisma.menuItem.findMany({
            where: {
                menuItemId: { in: menuItemIds },
            },
            select: {
                menuItemId: true,
                menuItemName: true,
                stockQuantity: true,
            },
        });

        const menuItemMap = new Map(menuItems.map((item) => [item.menuItemId, item]));

        for (const item of items) {
            const menuItem = menuItemMap.get(item.menuItemId);

            if (!menuItem) throw NotFoundError(`Item with ID '${item.menuItemId}' not found`);

            if (item.quantity > menuItem.stockQuantity) throw NotFoundError(`Item '${menuItem.menuItemName}' is out of stock. Required: ${item.quantity}, Available: ${menuItem.stockQuantity}`);
        }
    }

    /**
     * Reduces the stock for the given items. This should be called after a successful payment.
     * This operation is done in a transaction to ensure all stock updates succeed or none do.
     */
    async reduceStock(items: CartItemSummary[]) {
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
