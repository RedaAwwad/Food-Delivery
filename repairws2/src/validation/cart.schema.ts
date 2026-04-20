import Joi from "joi";

const AddToCartSchema = Joi.object({
  menuItemId: Joi.string().uuid().required().messages({
    "any.required": "MenuItem ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
}).required();

const UpdateQuantitySchema = Joi.object({
  cartItemId: Joi.string().uuid().required().messages({
    "any.required": "Cart Item ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
}).required();

const RemoveCartItemSchema = Joi.object({
  cartItemId: Joi.string().uuid().required().messages({
    "any.required": "Cart Item ID is required",
  }),
}).required();

export { AddToCartSchema, UpdateQuantitySchema, RemoveCartItemSchema };
