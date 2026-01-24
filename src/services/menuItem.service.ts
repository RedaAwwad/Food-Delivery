import { createMenuItemDto, updateMenuItemDto } from "../dto/menuItem.dto";
import { menuItemRepository } from "../repositories/menuItem.repository";
import { CartItemWithMenuItem } from "../types/cartItemWithMenuItem.type";
import { ConflictError, NotFoundError } from "../utils/errors";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { performanceContext } from "../utils/performance.utils";
import { formatPagination, PaginationDto } from "../utils/pagination.utils";

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

  async validateStock(items: CartItemWithMenuItem[], tx?: any) {
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

  async reduceStock(items: CartItemWithMenuItem[], tx?: any) {
    const stockUpdates = items.map((item) => {
      return menuItemRepository.reduceStock(item.menuItemId, item.quantity, tx);
    });

    await Promise.all(stockUpdates);
  }
}

export const menuItemService = new MenuItemService();
