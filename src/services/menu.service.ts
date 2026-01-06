import { createMenuDto, updateMenuDto } from "../dto/menu.dto";
import { menuRepository } from "../repositories/menu.repository";

class MenuService {
    async getActiveMenuByRestaurantId(restaurantId: string) {
        const menu = await menuRepository.getActiveMenuByRestaurantId(restaurantId);
        return menu;
    }
    
    async createMenu(data: createMenuDto) {
        const menu = await menuRepository.createMenu(data);
        return menu;
    }

    async updateMenu(data: updateMenuDto) {
        const menu = await menuRepository.updateMenu(data);
        return menu;
    }

    async deleteMenu(menuId: string) {
        const menu = await menuRepository.deleteMenu(menuId);
        return menu;
    }

    async enableOrDisableMenu(menuId: string) {
        const menu = await menuRepository.enableOrDisableMenu(menuId);
        return menu;
    }

    async viewHistoryListOfRestaurantMenus(restaurantId: string) {
        const menus = await menuRepository.viewHistoryListOfRestaurantMenus(restaurantId);
        return menus;
    }
}

export const menuService = new MenuService();
