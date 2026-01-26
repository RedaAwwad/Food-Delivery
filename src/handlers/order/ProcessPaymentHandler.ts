import { OrderHandler } from "./base/OrderHandler";
import { OrderContext } from "../../types/OrderContext";
import { paymentService } from "../../services/payment.service";
import { InternalServerError } from "../../utils/errors";

/**
 * Processes payment through the payment service.
 */
export class ProcessPaymentHandler extends OrderHandler {
    protected async handle(context: OrderContext): Promise<void> {
        console.log(`[ProcessPaymentHandler] Processing payment`);

        if (!context.order) {
            throw InternalServerError("Order not found in context (ProcessPayment)");
        }

        const paymentResult = await paymentService.processPayment(
            context.customerId,
            context.order.totalAmount
        );

        context.paymentResult = paymentResult;

        if (paymentResult.success) {
            console.log(`[ProcessPaymentHandler] Payment successful. Transaction ID: ${paymentResult.transactionId}`);
            context.shouldReduceInventory = true;
            context.shouldClearCart = true;
        } else {
            console.log(`[ProcessPaymentHandler] Payment failed`);
            context.shouldReduceInventory = false;
            context.shouldClearCart = false;
        }
    }
}
