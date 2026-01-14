import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { notificationService } from "../../services/notification.service";

/**
 * Sends notification to the restaurant about the new order.
 * This is an async operation that doesn't block the main flow.
 */
export class NotifyRestaurantHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.finalOrder) {
            console.log(`[NotifyRestaurantHandler] No final order found, skipping notification`);
            return;
        }

        console.log(`[NotifyRestaurantHandler] Sending notification to restaurant`);

        try {
            // Fire and forget - don't wait for completion
            notificationService.notifyRestaurant(
                context.restaurantId,
                context.finalOrder.orderId
            ).catch(error => {
                console.error(`[NotifyRestaurantHandler] Failed to send notification:`, error);
            });

            console.log(`[NotifyRestaurantHandler] Notification queued`);
        } catch (error) {
            // Log but don't throw - notifications shouldn't fail the order
            console.error(`[NotifyRestaurantHandler] Error queuing notification:`, error);
        }
    }
}
