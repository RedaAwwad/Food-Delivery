import Joi from "joi";

export const getActiveMenuSchema = {
    body: Joi.object().required().keys({
        restaurantId: Joi.string().required(),
    })
}

export const createMenuSchema = {
    body: Joi.object().required().keys({
        restaurantId: Joi.string().required(),
        menuDesc: Joi.string().required(),
        isActive: Joi.boolean().required(),
    })
}

export const updateMenuSchema = {
    body: Joi.object().required().keys({
        menuId: Joi.string().required(),
        menuDesc: Joi.string().required(),
        isActive: Joi.boolean().required(),
    })
}

export const deleteMenuSchema = {
    body: Joi.object().required().keys({
        menuId: Joi.string().required(),
    })
}

export const enableOrDisableMenuSchema = {
    body: Joi.object().required().keys({
        menuId: Joi.string().required(),
    })
}

export const viewHistoryListOfRestaurantMenusSchema = {
    body: Joi.object().required().keys({
        restaurantId: Joi.string().required(),
    })
}
