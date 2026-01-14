import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { orderRepository } from "../../repositories/order.repository";
import { OrderStatusKey } from "../../generated/prisma";

/**
 * Creates the order record with PENDING status.
 */
export class CreateOrderHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[CreateOrderHandler] Creating order record`);

        if (!context.cartItems) {
            throw new Error("Cart items not found in context");
        }

        const order = await orderRepository.createOrder({
            customerId: context.customerId,
            restaurantId: context.restaurantId,
            cartItems: context.cartItems,
            orderStatus: OrderStatusKey.PENDING,
        }, context.tx);

        context.order = order;
        console.log(`[CreateOrderHandler] Order created with ID: ${order.orderId}`);
    }
}
