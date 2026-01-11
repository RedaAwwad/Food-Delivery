import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { cartRepository } from "../../repositories/cart.repository";
import { CustomError } from "../../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

/**
 * Fetches cart items and validates that the cart is not empty.
 */
export class ValidateCartHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[ValidateCartHandler] Fetching cart items for customer: ${context.customerId}`);

        const cart = await cartRepository.getCartWithCartItemsByCustomerId(context.customerId);
        // Handle the case where cart is not found (returns empty array based on repository logic)
        // or returns a cart object.
        const cartItems = (Array.isArray(cart) ? [] : cart?.cartItems) || [];

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
