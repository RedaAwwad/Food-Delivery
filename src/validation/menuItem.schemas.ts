import Joi from "joi";

export const getAllMenuItemByMenuCategoryIdSchema = {
    body: Joi.object().required().keys({
        menuCategoryId: Joi.string().required(),
    })
}

export const createMenuItemSchema = {
    body: Joi.object().required().keys({
        menuItemName: Joi.string().required(),
        menuItemDesc: Joi.string().required(),
        menuItemImageUrl: Joi.string().required(),
        price: Joi.number().required(),
        stockQuantity: Joi.number().required(),
    })
}

export const updateMenuItemSchema = {
    body: Joi.object().required().keys({
        menuItemName: Joi.string().required(),
        menuItemDesc: Joi.string().required(),
        menuItemImageUrl: Joi.string().required(),
        price: Joi.number().required(),
        stockQuantity: Joi.number().required(),
    })
}

export const deleteMenuItemSchema = {
    body: Joi.object().required().keys({
        menuItemId: Joi.string().required(),
    })
}

export const searchMenuItemSchema = {
    query: Joi.object().keys({
        menuItemName: Joi.string().min(1).max(100).optional(),
    })
}
