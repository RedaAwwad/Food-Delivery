import { menuCategoryService } from "../services/menuCategory.service";
import { Request, Response } from "express";
import { BadRequestError } from "../utils/errors";

class MenuCategoryController {
    async findAllMenuCategoriesByMenuId(req: Request, res: Response) {
        const menuCategories = await menuCategoryService.findAllMenuCategoriesByMenuId(req.body.menuId);
        if (!menuCategories)
            throw BadRequestError("No Menu categories Was Found For This Menu");
        res.status(200).json(menuCategories);
    }

    async createMenuCategory(req: Request, res: Response) {
        const menuCategory = await menuCategoryService.createMenuCategory(req.body);
        if (!menuCategory)
            throw BadRequestError("Failed To Create Menu category");
        res.status(201).json(menuCategory);
    }

    async updateMenuCategory(req: Request, res: Response) {
        const menuCategory = await menuCategoryService.updateMenuCategory(req.body);
        if (!menuCategory)
            throw BadRequestError("Failed To Update Menu category");
        res.status(200).json(menuCategory);
    }

    async deleteMenuCategory(req: Request, res: Response) {
        const menuCategory = await menuCategoryService.deleteMenuCategory(req.body.menuCategoryId);
        if (!menuCategory)
            throw BadRequestError("Failed To Delete Menu category");
        res.status(200).json(menuCategory);
    }
}

export const menuCategoryController = new MenuCategoryController();
