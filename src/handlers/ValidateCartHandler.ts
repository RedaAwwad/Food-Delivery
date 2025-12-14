import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../types/OrderContext";
import { cartRepository } from "../repositories/cart.repository";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

/**
 * Fetches cart items and validates that the cart is not empty.
 */
export class ValidateCartHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[ValidateCartHandler] Fetching cart items for customer: ${context.customerId}`);

        const cartItems = await cartRepository.getCartItemsByCustomerId(context.customerId);

        if (!cartItems || cartItems.length === 0) {
            throw new CustomError({
                message: "Cart is empty. Cannot place an order.",
                statusCode: StatusCodes.BAD_REQUEST,
            });
        }

        context.cartItems = cartItems;
        console.log(`[ValidateCartHandler] Cart validated with ${cartItems.length} items`);
    }
}
