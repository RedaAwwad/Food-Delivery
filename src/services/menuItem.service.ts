import { createMenuItemDto, updateMenuItemDto } from "../dto/menuItem.dto";
import { menuItemRepository } from "../repositories/menuItem.repository";
import { CartItemSummary } from "../types/CartItemSummary";
import { ConflictError, NotFoundError } from "../utils/errors";
import { performanceContext } from "../utils/performance.utils";
import { formatPagination, PaginationDto } from "../utils/pagination.utils";
import { orderService } from "./order.service";

class MenuItemService {
  async getAllMenuItemsByMenuCategoryId(menuCategoryId: string) {
    const menuItem = await menuItemRepository.getAllMenuItemsByMenuCategoryId(menuCategoryId);
    return menuItem;
  }

  async getMenuItemById(menuItemId: string) {
    const menuItem = await menuItemRepository.getMenuItemById(menuItemId);
    return menuItem;
  }

  async createMenuItem(data: createMenuItemDto) {
    const menuItem = await menuItemRepository.createMenuItem(data);
    return menuItem;
  }

  async updateMenuItem(data: updateMenuItemDto) {
    const menuItem = await menuItemRepository.updateMenuItem(data);
    return menuItem;
  }

  async deleteMenuItem(menuItemId: string) {
    const menuItem = await menuItemRepository.deleteMenuItem(menuItemId);
    return menuItem;
  }

  async searchMenuItem(keyword: string, query: PaginationDto) {
    return await performanceContext(async () => {
      const { menuItems, total } = await menuItemRepository.searchMenuItem(keyword, query);
      return {
        data: menuItems,
        meta: formatPagination({
          page: Number(query.page),
          perPage: Number(query.perPage),
          total,
        }),
      };
    });
  }

  async validateStock(items: CartItemSummary[], tx?: any) {
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await menuItemRepository.getMenuItemsForStockCheck(menuItemIds, tx);

    const menuItemMap = new Map(menuItems.map((item) => [item.menuItemId, item]));

    for (const item of items) {
      const menuItem = menuItemMap.get(item.menuItemId);

      if (!menuItem) throw NotFoundError(`Item with ID '${item.menuItemId}' not found`);

      if (item.quantity > menuItem.stockQuantity)
        throw ConflictError(
          `Item '${menuItem.menuItemName}' is out of stock. Required: ${item.quantity}, Available: ${menuItem.stockQuantity}`
        );
    }
  }

  async reduceStock(items: CartItemSummary[], tx?: any) {
    const stockUpdates = items.map((item) => {
      return menuItemRepository.reduceStock(item.menuItemId, item.quantity, tx);
    });

    await Promise.all(stockUpdates);
  }

  async restoreStock(orderId: string) {
    const order = await orderService.findOrderById(orderId);
    if (!order) throw NotFoundError("Order not found");

    const itemsToRestore = order.orderItems.map(item => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity
    }));

    await menuItemRepository.restoreStockBatch(itemsToRestore);
  }
}

export const menuItemService = new MenuItemService();
