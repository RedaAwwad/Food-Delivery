import Joi from "joi";

export const findOrderByIdSchema = {
    params: Joi.object().required().keys({
        orderId: Joi.string().uuid().required()
    })
}

export const cancelOrderSchema = {
    params: Joi.object().required().keys({
        orderId: Joi.string().uuid().required(),
    })
}

export const updateOrderStatusSchema = {
    body: Joi.object().required().keys({
        orderId: Joi.string().uuid().required(),
        newOrderStatus: Joi.string().required(),
    })
}