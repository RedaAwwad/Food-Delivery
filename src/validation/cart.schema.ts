import Joi from "joi";

const AddToCartSchema = Joi.object({
  menuItemId: Joi.number().integer().required().messages({
    "any.required": "Item ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  price: Joi.number().min(1).required().messages({
    "number.base": "price must be a number",
    "number.min": "price must be at least 1",
    "any.required": "price is required",
  }),
});

export { AddToCartSchema };
