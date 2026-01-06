
import Joi from "joi";
// 
const orderStatusKeys = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "PICKED_UP",
  "DELIVERED",
];
export const updateOrderStatusSchema = Joi.object().keys({
    // cheak enum OrderStatusKey in prisma
    orderStatusKey:Joi.string().valid(...orderStatusKeys).required()
})
