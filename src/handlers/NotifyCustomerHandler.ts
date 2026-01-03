import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../types/OrderContext";
import { notificationService } from "../services/notification.service";

/**
 * Sends notification to the customer about their order.
 * This is an async operation that doesn't block the main flow.
 */
export class NotifyCustomerHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.finalOrder) {
            console.log(`[NotifyCustomerHandler] No final order found, skipping notification`);
            return;
        }

        console.log(`[NotifyCustomerHandler] Sending notification to customer`);

        try {
            // Fire and forget - don't wait for completion
            notificationService.notifyCustomer(
                context.customerId,
                context.finalOrder.orderId,
                context.finalOrder.orderStatus
            ).catch(error => {
                console.error(`[NotifyCustomerHandler] Failed to send notification:`, error);
            });

            console.log(`[NotifyCustomerHandler] Notification queued`);
        } catch (error) {
            // Log but don't throw - notifications shouldn't fail the order
            console.error(`[NotifyCustomerHandler] Error queuing notification:`, error);
        }
    }
}
