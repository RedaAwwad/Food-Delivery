import { menuItemService } from "../services/menuItem.service";
import { Request, Response } from "express";
import { BadRequestError } from "../utils/errors";
import { SuccessResponse } from "../utils/response/success-response";

class MenuItemController {
  async getAllMenuItemByMenuCategoryId(req: Request, res: Response) {
    const menuCategoryId = req.params.menuCategoryId;
    if (!menuCategoryId) throw BadRequestError("menuCategoryId is required");

    const menuItem = await menuItemService.getAllMenuItemsByMenuCategoryId(menuCategoryId);
    return res.status(200).json(menuItem);
  }

  async getMenuItemById(req: Request, res: Response) {
    const menuItemId = req.params.menuItemId;
    if (!menuItemId) throw BadRequestError("menuItemId is required");

    const menuItem = await menuItemService.getMenuItemById(menuItemId);
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
    const keyword = req.params.keyword as string;
    const { data, meta } = await menuItemService.searchMenuItem(keyword, req.query);
    return res.status(200).json(
      new SuccessResponse({
        data,
        meta,
      })
    );
  }
}

export const menuItemController = new MenuItemController();
