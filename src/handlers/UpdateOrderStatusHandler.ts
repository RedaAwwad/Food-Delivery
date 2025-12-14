import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../types/OrderContext";
import { orderRepository } from "../repositories/order.repository";
import { OrderStatus } from "../enums/orderStatus.enum";

/**
 * Updates order status based on payment result (COMPLETED or CANCELED).
 */
export class UpdateOrderStatusHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[UpdateOrderStatusHandler] Updating order status`);

        if (!context.order || !context.paymentResult) {
            throw new Error("Order or payment result not found in context");
        }

        const newStatus = context.paymentResult.success
            ? OrderStatus.COMPLETED
            : OrderStatus.CANCELED;

        const updatedOrder = await orderRepository.updateOrderStatus(
            context.order.orderId,
            newStatus
        );

        context.finalOrder = updatedOrder;
        console.log(`[UpdateOrderStatusHandler] Order status updated to: ${newStatus}`);
    }
}
