import Joi from "joi";
import { CartEventType } from "../generated/prisma/enums";

export const CartEventSchema = Joi.object({
    eventType: Joi.string()
        .valid(...Object.values(CartEventType))
        .required(),
    menuItemId: Joi.string().when("eventType", {
        is: Joi.valid(
            CartEventType.ADD_TO_CART,
            CartEventType.UPDATE_QUANTITY,
            CartEventType.REMOVE_FROM_CART
        ),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
    quantity: Joi.number().when("eventType", {
        is: Joi.valid(CartEventType.ADD_TO_CART, CartEventType.UPDATE_QUANTITY),
        then: Joi.required(),
        otherwise: Joi.optional(),
    }),
});
