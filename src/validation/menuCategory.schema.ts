import Joi from "joi";

export const findAllMenuCategoriesByMenuIdSchema = Joi.object({
    menuId: Joi.string().required(),
}).required();

export const createMenuCategorySchema = Joi.object({
    menuId: Joi.string().required(),
    menuCategoryName: Joi.string().required(),
    menuCategoryImageUrl: Joi.string().optional(),
}).required();

export const updateMenuCategorySchema = Joi.object({
    menuCategoryId: Joi.string().required(),
    menuCategoryName: Joi.string().optional(),
    menuCategoryImageUrl: Joi.string().optional(),
}).required();

export const deleteMenuCategorySchema = Joi.object({
    menuCategoryId: Joi.string().required(),
}).required();
