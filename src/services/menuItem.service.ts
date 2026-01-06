import { createMenuItemDto, updateMenuItemDto } from "../dto/menuItem.dto";
import { menuItemRepository } from "../repositories/menuItem.repository";

class MenuItemService {
    async getAllMenuItemsByMenuCategoryId(menuCategoryId: string) {
        const menuItem = await menuItemRepository.getAllMenuItemsByMenuCategoryId(menuCategoryId);
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

    async searchMenuItem(query: string) {
        const menuItem = await menuItemRepository.searchMenuItem(query);
        return menuItem;
    }
}

export const menuItemService = new MenuItemService();