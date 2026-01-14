import { menuService } from "../services/menu.service";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";

class MenuController {
    async getActiveMenuByRestaurantId(req: Request, res: Response, next: NextFunction) {
        const menu = await menuService.getActiveMenuByRestaurantId(req.body.restaurantId);
        if (!menu)
            throw BadRequestError();
        return res.status(200).json(menu);
    }
    
    async createMenu(req: Request, res: Response, next: NextFunction) {
        const menu = await menuService.createMenu(req.body);
        if (!menu)
            throw BadRequestError();
        return res.status(201).json(menu);
    }

    async updateMenu(req: Request, res: Response, next: NextFunction) {
        const menu = await menuService.updateMenu(req.body);
        if (!menu)
            throw BadRequestError();
        return res.status(200).json(menu);
    }

    async deleteMenu(req: Request, res: Response, next: NextFunction) {
        const menu = await menuService.deleteMenu(req.body.menuId);
        if (!menu)
            throw BadRequestError();
        return res.status(200).json(menu);
    }

    async enableOrDisableMenu(req: Request, res: Response, next: NextFunction) {
        const menu = await menuService.enableOrDisableMenu(req.body.menuId);
        if (!menu)
            throw BadRequestError();
        return res.status(200).json(menu);
    }

    async viewHistoryListOfRestaurantMenus(req: Request, res: Response, next: NextFunction) {
        const menus = await menuService.viewHistoryListOfRestaurantMenus(req.body.restaurantId);
        if (!menus)
            throw BadRequestError();
        return res.status(200).json(menus);
    }
}

export const menuController = new MenuController();