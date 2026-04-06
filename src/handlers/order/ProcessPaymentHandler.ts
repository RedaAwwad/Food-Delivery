import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { paymentService } from "../../services/PaymentService";
import { InternalServerError } from "../../utils/errors";

/**
 * Calls PaymentService.createPaymentIntent() using the already-created order.
 *
 * Key behaviours:
 * - The order MUST already exist in context (CreateOrderHandler runs before this).
 * - Uses idempotencyKey = `order_${orderId}` — tied to THIS order, not the cart.
 * - Stores the clientSecret in context so it can be returned to the frontend.
 * - Payment is NOT confirmed here — the frontend completes it, Stripe fires a webhook.
 */
export class ProcessPaymentHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[ProcessPaymentHandler] Creating PaymentIntent`);

        if (!context.order) throw InternalServerError("Order not found in context (ProcessPayment)");

        const result = await paymentService.createPaymentIntent(
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
            success: result.syncSuccess || false,
            transactionId: result.paymentIntentId,
        };

        // clientSecret returned to the API caller so frontend can complete payment
        context.clientSecret = result.clientSecret;

        if (result.syncSuccess) {
            console.log(`[ProcessPaymentHandler] Synchronous payment success (COD). Enqueueing status update and cart clear.`);
            context.shouldUpdateOrderStatus = true;
            context.shouldClearCart = true;
        } else {
            // Cart is managed by the webhook later.
            context.shouldUpdateOrderStatus = false;
            context.shouldClearCart = false;
            console.log(`[ProcessPaymentHandler] PaymentIntent created: ${result.paymentIntentId}`);
        }
    }
}
