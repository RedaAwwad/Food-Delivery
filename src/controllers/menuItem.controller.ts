import { menuItemService } from "../services/menuItem.service";
import { Request, Response } from "express";

class MenuItemController {
    async getAllMenuItemByMenuCategoryId(req: Request, res: Response) {
        const menuItem = await menuItemService.getAllMenuItemsByMenuCategoryId(req.body.menuCategoryId);
        return res.status(200).json(menuItem);
    }

    async createMenuItem(req: Request, res: Response) {
        const menuItem = await menuItemService.createMenuItem(req.body);
        return res.status(200).json(menuItem);
    }

    async updateMenuItem(req: Request, res: Response) {
        const menuItem = await menuItemService.updateMenuItem(req.body);
        return res.status(200).json(menuItem);
    }

    async deleteMenuItem(req: Request, res: Response) {
        const menuItem = await menuItemService.deleteMenuItem(req.body.menuItemId);
        return res.status(200).json(menuItem);
    }

    async searchMenuItem(req: Request, res: Response) {
        const menuItem = await menuItemService.searchMenuItem(req.query.menuItemName as string);
        return res.status(200).json(menuItem);
    }
}

export const menuItemController = new MenuItemController();