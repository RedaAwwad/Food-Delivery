import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { auditService } from "../../services/audit.service";

/**
 * Logs audit information about the order creation.
 */
export class AuditLogHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        if (!context.finalOrder) {
            console.log(`[AuditLogHandler] No final order found, skipping audit log`);
            return;
        }

        console.log(`[AuditLogHandler] Creating audit log entry`);

        try {
            await auditService.logOrderCreation(
                context.finalOrder.orderId,
                context.customerId,
                context.restaurantId,
                context.finalOrder.totalAmount
            );

            console.log(`[AuditLogHandler] Audit log created successfully`);
        } catch (error) {
            // Log but don't throw - audit failures shouldn't fail the order
            console.error(`[AuditLogHandler] Failed to create audit log:`, error);
        }
    }
}
