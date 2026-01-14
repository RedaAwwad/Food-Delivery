import Joi from "joi";

export const findAllMenuCategoriesByMenuIdSchema = {
    body: Joi.object().required().keys({
        menuId: Joi.string().required(),
    })
}

export const createMenuCategorySchema = {
    body: Joi.object().required().keys({
        menuId: Joi.string().required(),
        menuCategoryName: Joi.string().required(),
        menuCategoryImageUrl: Joi.string().optional(),
    })
}

export const updateMenuCategorySchema = {
    body: Joi.object().required().keys({
        menuCategoryId: Joi.string().required(),
        menuCategoryName: Joi.string().optional(),
        menuCategoryImageUrl: Joi.string().optional(),
    })
}

export const deleteMenuCategorySchema = {
    body: Joi.object().required().keys({
        menuCategoryId: Joi.string().required(),
    })
}
