import { prisma } from "../config/prisma.config";
import { createMenuItemDto, updateMenuItemDto } from "../dto/menuItem.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "../generated/prisma";

class MenuItemRepository {
    async getAllMenuItemsByMenuCategoryId(menuCategoryId: string) {
        const menuItem = await prisma.menuItem.findMany({
            where: {
                menuCategoryId: menuCategoryId,
            }, select: {
                menuItemId: true,
                menuItemName: true,
                menuItemDesc: true,
                menuItemImageUrl: true,
                price: true,
            }
        });

        if (!menuItem)
            throw NotFoundError("no menu items found");

        return menuItem;
    }

    async getMenuItemById(menuItemId: string) {
        const menuItem = await prisma.menuItem.findUnique({
            where: {
                menuItemId: menuItemId,
            }, select: {
                menuItemId: true,
                menuItemName: true,
                menuItemDesc: true,
                menuItemImageUrl: true,
                price: true,
                stockQuantity: true,
            }
        });
        if (!menuItem)
            throw NotFoundError("no menu item found");

        return menuItem;
    }

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

    async searchMenuItem(query: string) {
        const menuItem = await prisma.menuItem.findMany({
            where: {
                menuItemName: {
                    contains: query,
                    mode: "insensitive",
                },
            },
        });
        if (!menuItem)
            throw BadRequestError("Failed To Search Menu item");

        return menuItem;
    }

    async getMenuItemsForStockCheck(menuItemIds: string[], tx: PrismaTx | PrismaClient = prisma) {
        const menuItems = await tx.menuItem.findMany({
            where: {
                menuItemId: { in: menuItemIds },
            },
            select: {
                menuItemId: true,
                menuItemName: true,
                stockQuantity: true,
            },
        });
        return menuItems;
    }

    async reduceStock(menuItemId: string, quantity: number, tx: PrismaTx | PrismaClient = prisma) {
        return await tx.menuItem.update({
            where: { menuItemId },
            data: {
                stockQuantity: {
                    decrement: quantity,
                },
            },
        });
    }
}

export const menuItemRepository = new MenuItemRepository();