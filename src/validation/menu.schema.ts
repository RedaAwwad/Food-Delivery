import Joi from "joi";

export const getActiveMenuSchema = Joi.object({
  restaurantId: Joi.string().required(),
}).required();

export const createMenuSchema = Joi.object({
  restaurantId: Joi.string().required(),
  menuDesc: Joi.string().required(),
  isActive: Joi.boolean().required(),
}).required();

export const updateMenuSchema = Joi.object({
  menuId: Joi.string().required(),
  menuDesc: Joi.string().required(),
  isActive: Joi.boolean().required(),
}).required();

export const deleteMenuSchema = Joi.object({
  menuId: Joi.string().required(),
});

export const enableOrDisableMenuSchema = Joi.object({
  menuId: Joi.string().required(),
}).required();

export const viewHistoryListOfRestaurantMenusSchema = Joi.object({
  restaurantId: Joi.string().required(),
}).required();
