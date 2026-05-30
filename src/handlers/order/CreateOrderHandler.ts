import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { orderRepository } from "../../repositories/order.repository";
import { OrderStatusKey } from "../../generated/prisma/enums";
import { InternalServerError } from "../../utils/errors";
import { prisma } from "../../config/prisma.config";

/**
 * Creates the order record with PENDING status.
 */
export class CreateOrderHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[CreateOrderHandler] Creating order record`);

        if (!context.cartItems) {
            throw InternalServerError("Cart items not found in context (CreateOrder)");
        }

        const order = await orderRepository.createOrder({
            customerId: context.customerId,
            restaurantId: context.restaurantId,
            cartItems: context.cartItems,
            orderStatus: OrderStatusKey.PENDING,
        }, context.tx);

        context.order = order;

        await prisma.orderTracking.create({
            data: {
                orderId: order.orderId,
                customerId: context.customerId,
                trackingStatus: [{ orderStatusKey: "PENDING", updatedAt: new Date() }],
            },
        }).catch(() => {});

        console.log(`[CreateOrderHandler] Order created with ID: ${order.orderId}`);
    }
}
