/**
 * Mock audit service for logging important events.
 * In production, this would write to a database or logging service.
 */
class AuditService {
    /**
     * Logs an order creation event with audit information.
     */
    async logOrderCreation(
        orderId: string,
        customerId: string,
        restaurantId: string,
        totalAmount: number
    ): Promise<void> {
        const timestamp = new Date().toISOString();

        // Mock implementation - in production, this would write to a database
        console.log(`📝 [AuditService] Audit Log Entry:`);
        console.log(`   - Event: ORDER_CREATED`);
        console.log(`   - Order ID: ${orderId}`);
        console.log(`   - Customer ID: ${customerId}`);
        console.log(`   - Restaurant ID: ${restaurantId}`);
        console.log(`   - Total Amount: ${totalAmount}`);
        console.log(`   - Timestamp: ${timestamp}`);
        console.log(`   - Created By: ${customerId}`);

        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 50));

        console.log(`✅ [AuditService] Audit log entry created successfully`);
    }
}

export const auditService = new AuditService();
