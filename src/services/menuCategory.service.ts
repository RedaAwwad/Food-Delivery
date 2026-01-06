import { createMenuCategoryDto, updateMenuCategoryDto } from "../dto/menuCategory.dto";
import { menuCategoryRepository } from "../repositories/menuCategory.repository";

class MenuCategoryService {
    async findAllMenuCategoriesByMenuId(menuId: string) {
        return await menuCategoryRepository.findAllMenuCategoriesByMenuId(menuId);
    }

    async createMenuCategory(data: createMenuCategoryDto) {
        return await menuCategoryRepository.createMenuCategory(data);
    }

    async updateMenuCategory(data: updateMenuCategoryDto) {
        return await menuCategoryRepository.updateMenuCategory(data);
    }

    async deleteMenuCategory(menuCategoryId: string) {
        return await menuCategoryRepository.deleteMenuCategory(menuCategoryId);
    }
}

export const menuCategoryService = new MenuCategoryService();