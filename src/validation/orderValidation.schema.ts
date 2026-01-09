import Joi from "joi";
//
const orderStatusKeys = ["PENDING", "ACCEPTED", "PREPARING", "PICKED_UP", "DELIVERED"];
export const updateOrderStatusSchema = Joi.object({
  orderStatusKey: Joi.string()
    .valid(...orderStatusKeys)
    .required(),
}).required();
