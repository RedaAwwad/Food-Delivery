import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { orderService } from "../../services/order.service";
import { OrderStatusKey } from "../../generated/prisma/client";

/**
 * Updates order status based on payment result (COMPLETED or CANCELED).
 */
export class UpdateOrderStatusHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.shouldUpdateOrderStatus) {
            console.log(`[UpdateOrderStatusHandler] Skipping status update (handled asynchronously later)`);
            return;
        }

        console.log(`[UpdateOrderStatusHandler] Updating order status`);

        if (!context.order || !context.paymentResult) {
            throw new Error("Order or payment result not found in context");
        }

        const newStatus = context.paymentResult.success
            ? OrderStatusKey.COMPLETED
            : OrderStatusKey.CANCELED;

        const updatedOrder = await orderService.updateOrderStatus({
            orderId: context.order.orderId,
            newOrderStatus: newStatus
        });

        context.finalOrder = updatedOrder;
        console.log(`[UpdateOrderStatusHandler] Order status updated to: ${newStatus}`);
    }
}