import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { paymentService } from "../../services/PaymentService";
import { InternalServerError } from "../../utils/errors";

/**
 * Calls PaymentService.processPayment() using the already-created order.
 *
 * Key behaviours:
 * - The order MUST already exist in context (CreateOrderHandler runs before this).
 * - Uses idempotencyKey = `order_${orderId}` — tied to THIS order, not the cart.
 * - If requiresAction=true (Stripe, PayPal): stores clientSecret for the frontend to complete payment.
 * - If requiresAction=false (COD): marks payment as synchronously successful.
 */
export class ProcessPaymentHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[ProcessPaymentHandler] Creating PaymentIntent`);

        if (!context.order) throw InternalServerError("Order not found in context (ProcessPayment)");

        const result = await paymentService.processPayment(
            context.customerId,
            context.order.orderId,
            context.order.totalAmount,
            context.customerEmail,
            context.restaurantId,
            context.requestTimestamp,
            context.paymentProvider,
            context.paymentMethodId
        );

        // Store transactionId for PaymentAttempt linking in OrderService
        context.paymentResult = {
            success: !result.requiresAction, // if no action required (like COD), it's a sync success
            transactionId: result.transactionId || '',
        };

        // clientSecret returned to the API caller so frontend can complete payment
        if (result.clientSecret !== undefined) {
            context.clientSecret = result.clientSecret;
        }

        if (!result.requiresAction) {
            console.log(`[ProcessPaymentHandler] Synchronous payment success (no action req). Enqueueing status update and cart clear.`);
            context.shouldUpdateOrderStatus = true;
            context.shouldClearCart = true;
        } else {
            // Cart is managed by the webhook later.
            context.shouldUpdateOrderStatus = false;
            context.shouldClearCart = false;
            console.log(`[ProcessPaymentHandler] Payment processing started: ${result.transactionId}`);
        }
    }
}
