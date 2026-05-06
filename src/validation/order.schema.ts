import Joi from "joi";

export const updateOrderStatusSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  newOrderStatus: Joi.string().required(),
}).required();

export const cancelOrderByRestaurantSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  reason: Joi.string().min(5).required(),
}).required();
