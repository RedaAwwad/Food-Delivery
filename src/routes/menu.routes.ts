import express from "express";
import { menuController } from "../controllers/menu.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import {
  createMenuSchema,
  deleteMenuSchema,
  enableOrDisableMenuSchema,
  getActiveMenuSchema,
  updateMenuSchema,
  viewHistoryListOfRestaurantMenusSchema,
} from "../validation/menu.schema";

const menuRouter = express.Router();

menuRouter.use(isAuthenticated);

menuRouter.get(
  "/",
  validateRequest(getActiveMenuSchema),
  menuController.getActiveMenuByRestaurantId
);
menuRouter.post(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(createMenuSchema),
  menuController.createMenu
);
menuRouter.put(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(updateMenuSchema),
  menuController.updateMenu
);
menuRouter.delete(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(deleteMenuSchema),
  menuController.deleteMenu
);
menuRouter.patch(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(enableOrDisableMenuSchema),
  menuController.enableOrDisableMenu
);
menuRouter.get(
  "/all-menus",
  isAuthorized(["Owner"]),
  validateRequest(viewHistoryListOfRestaurantMenusSchema),
  menuController.viewHistoryListOfRestaurantMenus
);

export { menuRouter };
