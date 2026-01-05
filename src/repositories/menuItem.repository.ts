import { prisma } from "../config/prisma.config";
import { createMenuItemDto, updateMenuItemDto } from "../dto/menuItem.dto";
import { BadRequestError } from "../utils/errors";

class MenuItemRepository {
    async createMenuItem(data: createMenuItemDto) {
        const menuItem = await prisma.menuItem.create({
            data: {
                ...data,
            },
        });
        if (!menuItem)
            throw BadRequestError("Failed To Create Menu item");

        return menuItem;
    }

    async updateMenuItem(data: updateMenuItemDto) {
        const menuItem = await prisma.menuItem.update({
            where: {
                menuItemId: data.menuItemId,
            },
            data: {
                ...(data.menuItemName !== undefined && { menuItemName: data.menuItemName }),
                ...(data.menuItemDesc !== undefined && { menuItemDesc: data.menuItemDesc }),
                ...(data.price !== undefined && { price: data.price }),
                ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
            },
        });
        if (!menuItem)
            throw BadRequestError("Failed To Update Menu item");

        return menuItem;
    }

    async deleteMenuItem(menuItemId: string) {
        const menuItem = await prisma.menuItem.delete({
            where: {
                menuItemId: menuItemId,
            },
        });
        if (!menuItem)
            throw BadRequestError("Failed To Delete Menu item");

        return menuItem;
    }
}

export const menuItemRepository = new MenuItemRepository();