import express from "express";
import { menuCategoryController } from "../controllers/menuCategory.controller";
import { authenticate, isAuthorized } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate-request";
import { createMenuCategorySchema, deleteMenuCategorySchema, updateMenuCategorySchema } from "../validation/menuCategory.schema";

const menuCategoryRouter = express.Router();

menuCategoryRouter.get("/", menuCategoryController.findAllMenuCategoriesByMenuId);
menuCategoryRouter.post("/", authenticate, isAuthorized(["Owner"]), validateRequest(createMenuCategorySchema), menuCategoryController.createMenuCategory);
menuCategoryRouter.put("/", authenticate, isAuthorized(["Owner"]), validateRequest(updateMenuCategorySchema), menuCategoryController.updateMenuCategory);
menuCategoryRouter.delete("/", authenticate, isAuthorized(["Owner"]), validateRequest(deleteMenuCategorySchema), menuCategoryController.deleteMenuCategory);

export { menuCategoryRouter };