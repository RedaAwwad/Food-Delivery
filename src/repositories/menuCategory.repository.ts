import { prisma } from "../config/prisma.config";
import { createMenuCategoryDto, updateMenuCategoryDto } from "../dto/menuCategory.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";

class MenuCategoryRepository {
    async findAllMenuCategoriesByMenuId(menyId:  string) {
        const menuCategories = await prisma.menuCategory.findMany({
            where: {
                menuId: menyId
            },
            select: {
                menuCategoryId: true,
                menuCategoryName: true,
                menuCategoryImageUrl: true,
            }
        });

        if (!menuCategories)
            throw NotFoundError("No Menu categories Was Found For This Menu");

        return menuCategories;
    }

    async createMenuCategory(data: createMenuCategoryDto) {
        const menuCategory = await prisma.menuCategory.create({
            data: {
                menuId: data.menuId,
                menuCategoryName: data.menuCategoryName,
                menuCategoryImageUrl: data.menuCategoryImageUrl,
            },
            select: {
                menuCategoryId: true,
                menuCategoryName: true,
                menuCategoryImageUrl: true,
            }
        });
        if (!menuCategory)
            throw BadRequestError("Failed To Create Menu category");

        return menuCategory;
    }

    async updateMenuCategory(data: updateMenuCategoryDto) {
        const menuCategory = await prisma.menuCategory.update({
            where: {
                menuCategoryId: data.menuCategoryId,
            },
            data: {
                ...(data.menuCategoryName !== undefined && { menuCategoryName: data.menuCategoryName }),
                ...(data.menuCategoryImageUrl !== undefined && { menuCategoryImageUrl: data.menuCategoryImageUrl }),
            },
            select: {
                menuCategoryId: true,
                menuCategoryName: true,
                menuCategoryImageUrl: true,
            }
        });
        if (!menuCategory)
            throw BadRequestError("Failed To Update Menu category");

        return menuCategory;
    }

    async deleteMenuCategory(menuCategoryId: string) {
        const menuCategory = await prisma.menuCategory.delete({
            where: {
                menuCategoryId: menuCategoryId,
            },
        });
        if (!menuCategory)
            throw BadRequestError("Failed To Delete Menu category");

        return menuCategory;
    }
}

export const menuCategoryRepository = new MenuCategoryRepository();
