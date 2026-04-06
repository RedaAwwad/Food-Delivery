import { Request, Response } from 'express';
import stripe from '../utils/payment/stripe';
import { prisma } from '../config/prisma.config';
import { orderRepository } from '../repositories/order.repository';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';
import { cartService } from '../services/cart.service';
import { menuItemService } from '../services/menuItem.service';
import { PaymentAttemptStatus, OrderStatusKey } from '../generated/prisma/client';

class StripeWebhookController {

    async handleStripeWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;

        if (!sig) {
            res.status(400).send('Webhook Error: Missing stripe-signature header');
            return;
        }

        let event: any;
        try {
            // req.body must be the raw Buffer — requires express.raw() middleware on this route
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error('[Webhook] Signature verification failed:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        console.log(`[Webhook] Received event: ${event.type}`);

        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await this.handlePaymentFailure(event.data.object);
                    break;
                default:
                    console.log(`[Webhook] Unhandled event type: ${event.type}`);
            }

            // Always return 200 quickly — Stripe retries on non-2xx for 72 hours
            res.json({ received: true });
        } catch (err: any) {
            console.error(`[Webhook] Handler error for ${event.type}:`, err.message);
            // Return 500 so Stripe retries (our DB might be temporarily down)
            res.status(500).send(`Handler Error: ${err.message}`);
        }
    }

    /**
     * payment_intent.succeeded
     * - Updates order to COMPLETED
     * - Marks PaymentAttempt as SUCCESS
     * - Clears the cart
     * - Idempotent: safe to run multiple times (Stripe retries for 72h)
     */
    private async handlePaymentSuccess(paymentIntent: any) {
        const { orderId, customerId } = paymentIntent.metadata as {
            orderId: string;
            customerId: string;
        };

        if (!orderId) {
            console.error('[Webhook] payment_intent.succeeded missing orderId in metadata', paymentIntent.id);
            return; // Can't recover without orderId — log and return 200 so Stripe stops retrying
        }

        const idempotencyKey = `order_${orderId}`;

        // --- Webhook idempotency guard ---
        // Stripe retries webhooks for 72h. If we already processed this, return early.
        const attempt = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);
        if (attempt?.status === PaymentAttemptStatus.SUCCESS) {
            console.log(`[Webhook] Already processed payment for order ${orderId} — skipping`);
            return;
        }

        // --- Atomically confirm the order and finalize the payment attempt ---
        await prisma.$transaction(async (tx) => {
            await orderRepository.updateOrderStatus(
                { orderId, newOrderStatus: OrderStatusKey.COMPLETED },
                tx
            );

            await paymentAttemptRepository.updateStatus(
                idempotencyKey,
                PaymentAttemptStatus.SUCCESS,
                paymentIntent.id,
                { amount: paymentIntent.amount / 100 }
            );

            if (customerId) {
                await cartService.clearCart(customerId, tx);
            }
        });

        console.log(`[Webhook] Order ${orderId} confirmed. PaymentIntent: ${paymentIntent.id}`);

        // --- Save the new payment method if requested ---
        if (paymentIntent.setup_future_usage === 'off_session' && paymentIntent.payment_method && customerId) {
            try {
                // Ensure customer has settings
                let settings = await prisma.preferredPaymentSettings.findUnique({
                    where: { customerId }
                });

                if (!settings) {
                    settings = await prisma.preferredPaymentSettings.create({
                        data: { customerId, paymentMethodId: "temp" }
                    });
                }

                // Retrieve card details to show friendly name like "VISA ****1234"
                const pm = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
                let methodName = 'Credit Card';
                if (pm.card) {
                    methodName = `${pm.card.brand.toUpperCase()} ****${pm.card.last4}`;
                }

                // Check if this payment method is already securely saved
                // (We do a raw fetch to see if it exists)
                const existingPms = await prisma.paymentMethod.findMany({
                    where: { preferredPaymentSettingsId: settings.preferredPaymentSettingsId }
                });
                
                const alreadySaved = existingPms.some((dbPm: any) => 
                    dbPm.paymentMethodData?.stripePaymentMethodId === paymentIntent.payment_method
                );

                if (!alreadySaved) {
                    const newPm = await prisma.paymentMethod.create({
                        data: {
                            paymentMethodName: methodName,
                            paymentMethodData: {
                                provider: 'stripe',
                                stripePaymentMethodId: paymentIntent.payment_method,
                                stripeCustomerId: paymentIntent.customer || null,
                            },
                            preferredPaymentSettingsId: settings.preferredPaymentSettingsId
                        }
                    });

                    // Update default if it was newly created
                    if (settings.paymentMethodId === "temp") {
                        await prisma.preferredPaymentSettings.update({
                            where: { preferredPaymentSettingsId: settings.preferredPaymentSettingsId },
                            data: { paymentMethodId: newPm.paymentMethodId }
                        });
                    }
                    console.log(`[Webhook] Saved new payment method for customer ${customerId}: ${methodName}`);
                }
            } catch (err: any) {
                console.error(`[Webhook] Handled non-fatal error saving payment method:`, err.message);
            }
        }
        // Note: inventory was already reduced by ReduceInventoryHandler in the chain
    }

    /**
     * payment_intent.payment_failed
     * - Marks PaymentAttempt as FAILED
     * - Cancels the order
     * - Restores inventory
     */
    private async handlePaymentFailure(paymentIntent: any) {
        const { orderId } = paymentIntent.metadata as { orderId: string };

        if (!orderId) {
            console.error('[Webhook] payment_intent.payment_failed missing orderId in metadata', paymentIntent.id);
            return;
        }

        const idempotencyKey = `order_${orderId}`;

        // Guard against duplicate processing
        const attempt = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);
        if (attempt?.status === PaymentAttemptStatus.FAILED) {
            console.log(`[Webhook] Already processed failure for order ${orderId} — skipping`);
            return;
        }

        await paymentAttemptRepository.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.FAILED,
            paymentIntent.id,
            { error: paymentIntent.last_payment_error }
        );

        // Atomic: if restoreStock fails, the status update rolls back
        // and Stripe retries the webhook cleanly.
        await prisma.$transaction(async (tx) => {
            await orderRepository.updateOrderStatus(
                { orderId, newOrderStatus: OrderStatusKey.CANCELED },
                tx
            );

            await menuItemService.restoreStock(orderId, tx);
        });

        console.log(`[Webhook] Order ${orderId} canceled due to payment failure.`);
    }
}

export const stripeWebhookController = new StripeWebhookController();
