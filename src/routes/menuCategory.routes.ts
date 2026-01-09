import express from "express";
import { menuCategoryController } from "../controllers/menuCategory.controller";
import { isAuthenticated, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import {
  createMenuCategorySchema,
  deleteMenuCategorySchema,
  updateMenuCategorySchema,
} from "../validation/menuCategory.schema";

const menuCategoryRouter = express.Router();

menuCategoryRouter.use(isAuthenticated);

menuCategoryRouter.get("/", menuCategoryController.findAllMenuCategoriesByMenuId);
menuCategoryRouter.post(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(createMenuCategorySchema),
  menuCategoryController.createMenuCategory
);
menuCategoryRouter.put(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(updateMenuCategorySchema),
  menuCategoryController.updateMenuCategory
);
menuCategoryRouter.delete(
  "/",
  isAuthorized(["Owner"]),
  validateRequest(deleteMenuCategorySchema),
  menuCategoryController.deleteMenuCategory
);

export { menuCategoryRouter };
