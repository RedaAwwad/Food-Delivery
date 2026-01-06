import { prisma } from "../config/prisma.config";
import { createMenuDto, updateMenuDto } from "../dto/menu.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";

class MenuRepository {
    async getActiveMenuByRestaurantId(restaurantId: string) {
        return await prisma.menu.findFirst({
            where: {
                restaurantId: restaurantId,
                isActive: true,
            },
        });
    }
    
    async createMenu(Data: createMenuDto) {
        const menu = await prisma.menu.create({
            data: Data,
        });
        if (!menu)
            throw BadRequestError("Menu not created");

        return menu;
    }

    async updateMenu(Data: updateMenuDto) {
        try {
            return await prisma.menu.findUnique({
                where: {
                    menuId: Data.menuId,
                },
            });
        } catch (error: any) {
            if (error.code === "P2025") {
                throw NotFoundError("Menu not found");
            }
            throw BadRequestError("Menu not found");
        }
    }

    async deleteMenu(menuId: string) {
        const menu = await prisma.menu.findUnique({
            where: {
                menuId: menuId,
            },
        });
        if (!menu)
            throw NotFoundError("Menu not found");

        return await prisma.menu.delete({
            where: {
                menuId: menuId,
            },
        });
    }

    async enableOrDisableMenu(menuId: string) {
        const menu = await prisma.menu.findUnique({
            where: {
                menuId: menuId,
            },
        });
        if (!menu)
            throw NotFoundError("Menu not found");

        menu.isActive = !menu.isActive;
        return await prisma.menu.update({
            where: {
                menuId: menuId,
            },
            data: menu,
        });
    }

    async viewHistoryListOfRestaurantMenus(restaurantId: string) {
        return await prisma.menu.findMany({
            where: {
                restaurantId: restaurantId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}

export const menuRepository = new MenuRepository();