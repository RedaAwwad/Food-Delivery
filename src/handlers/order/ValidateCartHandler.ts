import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { cartService } from "../../services/cart.service";
import { BadRequestError } from "../../utils/errors";

/**
 * Fetches cart items and validates that the cart is not empty.
 */
export class ValidateCartHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[ValidateCartHandler] Fetching cart items for customer: ${context.customerId}`);

        const cart = await cartService.getCartWithCartItemsByCustomerId(context.customerId, context.tx);

        if (!cart) throw BadRequestError("Cart is empty. Cannot place an order.");

        const cartItems = cart.cartItems || [];

        if (!cartItems || cartItems.length === 0) throw BadRequestError("Cart is empty. Cannot place an order.");

        context.cartItems = cartItems;
        console.log(`[ValidateCartHandler] Cart validated with ${cartItems.length} items`);
    }
}
