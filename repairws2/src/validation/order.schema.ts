import Joi from "joi";

export const updateOrderStatusSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
  newOrderStatus: Joi.string().required(),
}).required();
