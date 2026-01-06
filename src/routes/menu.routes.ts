import express from "express";
import { menuController } from "../controllers/menu.controller";
import { authenticate, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import { createMenuSchema, deleteMenuSchema, enableOrDisableMenuSchema, getActiveMenuSchema, updateMenuSchema, viewHistoryListOfRestaurantMenusSchema } from "../validation/menu.schema";

const menuRouter = express.Router();

menuRouter.get("/", validateRequest(getActiveMenuSchema), menuController.getActiveMenuByRestaurantId);
menuRouter.post("/", authenticate, isAuthorized(["Owner"]), validateRequest(createMenuSchema), menuController.createMenu);
menuRouter.put("/", authenticate, isAuthorized(["Owner"]), validateRequest(updateMenuSchema), menuController.updateMenu);
menuRouter.delete("/", authenticate, isAuthorized(["Owner"]), validateRequest(deleteMenuSchema), menuController.deleteMenu);
menuRouter.patch("/", authenticate, isAuthorized(["Owner"]), validateRequest(enableOrDisableMenuSchema), menuController.enableOrDisableMenu);
menuRouter.get("/all-menus", authenticate, isAuthorized(["Owner"]), validateRequest(viewHistoryListOfRestaurantMenusSchema), menuController.viewHistoryListOfRestaurantMenus);

export { menuRouter }