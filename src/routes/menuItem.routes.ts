import express from "express";
import { menuItemController } from "../controllers/menuItem.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import {
  createMenuItemSchema,
  deleteMenuItemSchema,
  searchMenuItemSchema,
  updateMenuItemSchema,
} from "../validation/menuItem.schemas";

const menuItemRouter = express.Router();

menuItemRouter.use(isAuthenticated);

menuItemRouter.get("/", menuItemController.getAllMenuItemByMenuCategoryId);
menuItemRouter.post(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(createMenuItemSchema),
  menuItemController.createMenuItem
);
menuItemRouter.put(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(updateMenuItemSchema),
  menuItemController.updateMenuItem
);
menuItemRouter.delete(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(deleteMenuItemSchema),
  menuItemController.deleteMenuItem
);
menuItemRouter.get(
  "/search",
  validateRequest(searchMenuItemSchema),
  menuItemController.searchMenuItem
);

export default menuItemRouter;
