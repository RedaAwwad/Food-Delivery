/**
 * Mock notification service for sending notifications.
 * In production, this would integrate with email, SMS, or push notification services.
 */
class NotificationService {
    /**
     * Sends a notification to the restaurant about a new order.
     */
    async notifyRestaurant(restaurantId: string, orderId: string): Promise<void> {
        // Mock implementation - in production, this would send actual notifications
        console.log(`📧 [NotificationService] Sending notification to restaurant ${restaurantId} about order ${orderId}`);

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log(`✅ [NotificationService] Restaurant notification sent successfully`);
    }

    /**
     * Sends a notification to the customer about their order.
     */
    async notifyCustomer(customerId: string, orderId: string, orderStatus: string, reason?: string): Promise<void> {
        // Mock implementation - in production, this would send actual notifications
        console.log(`📧 [NotificationService] Sending notification to customer ${customerId} about order ${orderId} (Status: ${orderStatus})`);
        if (reason) console.log(`📧 [NotificationService] Reason: ${reason}`);

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100));

        console.log(`✅ [NotificationService] Customer notification sent successfully`);
    }
}

export const notificationService = new NotificationService();
