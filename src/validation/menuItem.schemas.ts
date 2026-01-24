import Joi from "joi";

export const getAllMenuItemByMenuCategoryIdSchema = Joi.object({
  menuCategoryId: Joi.string().required(),
}).required();

export const getMenuItemByIdSchema = Joi.object({
  menuItemId: Joi.string().required(),
}).required();

export const createMenuItemSchema = Joi.object({
  menuCategoryId: Joi.string().required(),
  menuItemName: Joi.string().required(),
  menuItemDesc: Joi.string().required(),
  menuItemImageUrl: Joi.string().required(),
  price: Joi.number().required(),
  stockQuantity: Joi.number().required(),
}).required();

export const updateMenuItemSchema = Joi.object({
  menuItemName: Joi.string().required(),
  menuItemDesc: Joi.string().required(),
  menuItemImageUrl: Joi.string().required(),
  price: Joi.number().required(),
  stockQuantity: Joi.number().required(),
}).required();

export const deleteMenuItemSchema = Joi.object({
  menuItemId: Joi.string().required(),
}).required();

export const searchMenuItemSchema = Joi.object({
  menuItemName: Joi.string().min(1).max(100).optional(),
}).required();
