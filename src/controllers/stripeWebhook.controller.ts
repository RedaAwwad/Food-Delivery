import { Request, Response } from 'express';
import stripe from '../utils/payment/stripe';
import { prisma } from '../config/prisma.config';
import { orderService } from '../services/order.service';
import { paymentAttemptService } from '../services/PaymentAttemptService';
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
                    await this.handlePaymentCaptured(event.data.object);
                    break;
                case 'payment_intent.amount_capturable_updated':
                    await this.handlePaymentAuthorized(event.data.object);
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
            require('fs').writeFileSync('d:/Mentorship/Restaurant/Project/Food Delivery/Food-Delivery/webhook-error.log', err.stack || err.message || JSON.stringify(err));
            // Return 500 so Stripe retries (our DB might be temporarily down)
            res.status(500).send(`Handler Error: ${err.message}`);
        }
    }

    /**
     * payment_intent.amount_capturable_updated
     * - Marks PaymentAttempt as AUTHORIZED
     * - Order status remains PENDING
     * - Saves payment method if requested
     */
    private async handlePaymentAuthorized(paymentIntent: any) {
        const { orderId, customerId } = paymentIntent.metadata as {
            orderId: string;
            customerId: string;
        };

        if (!orderId) {
            console.error('[Webhook] payment_intent.amount_capturable_updated missing orderId in metadata', paymentIntent.id);
            return;
        }

        const idempotencyKey = `order_${orderId}`;

        const attempt = await paymentAttemptService.findAttempt(idempotencyKey);
        if (attempt?.status === PaymentAttemptStatus.AUTHORIZED || attempt?.status === PaymentAttemptStatus.SUCCESS) {
            console.log(`[Webhook] Already processed authorization for order ${orderId} — skipping`);
            return;
        }

        await paymentAttemptService.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.AUTHORIZED,
            paymentIntent.id,
            { amount: paymentIntent.amount / 100 }
        );

        console.log(`[Webhook] Order ${orderId} authorized. PaymentIntent: ${paymentIntent.id}`);

        // Finalize cart-level attempt
        try {
            const order = await orderService.findOrderById(orderId);
            const cartKey = `cart_${customerId}_${order.restaurantId}`;
            const cartAttempt = await paymentAttemptService.findAttempt(cartKey);
            if (cartAttempt && cartAttempt.status === PaymentAttemptStatus.PENDING) {
                await paymentAttemptService.updateStatus(
                    cartKey,
                    PaymentAttemptStatus.SUCCESS,
                    paymentIntent.id,
                    { finalizedBy: 'webhook_auth', orderId }
                );
                console.log(`[Webhook] Cart-level attempt finalized for customer ${customerId}`);
            }
        } catch (err: any) {
            console.warn(`[Webhook] Could not finalize cart-level attempt:`, err.message);
        }

        // Save new payment method
        await this.savePaymentMethodInfo(paymentIntent, customerId);
    }

    /**
     * payment_intent.succeeded
     * - Updates order to COMPLETED
     * - Marks PaymentAttempt as SUCCESS
     * - Clears the cart
     */
    private async handlePaymentCaptured(paymentIntent: any) {
        const { orderId, customerId } = paymentIntent.metadata as {
            orderId: string;
            customerId: string;
        };

        if (!orderId) {
            console.error('[Webhook] payment_intent.succeeded missing orderId in metadata', paymentIntent.id);
            return;
        }

        const idempotencyKey = `order_${orderId}`;

        const attempt = await paymentAttemptService.findAttempt(idempotencyKey);
        if (attempt?.status === PaymentAttemptStatus.SUCCESS) {
            console.log(`[Webhook] Already processed capture for order ${orderId} — skipping`);
            return;
        }

        await prisma.$transaction(async (tx) => {
            await orderService.updateOrderStatus(
                { orderId, newOrderStatus: OrderStatusKey.COMPLETED },
                tx
            );

            await paymentAttemptService.updateStatus(
                idempotencyKey,
                PaymentAttemptStatus.SUCCESS,
                paymentIntent.id,
                { amount: paymentIntent.amount_received / 100 }
            );

            if (customerId) {
                await cartService.clearCart(customerId, tx);
            }
        });

        console.log(`[Webhook] Order ${orderId} captured and completed. PaymentIntent: ${paymentIntent.id}`);
    }

    private async savePaymentMethodInfo(paymentIntent: any, customerId: string) {
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
        const attempt = await paymentAttemptService.findAttempt(idempotencyKey);
        if (attempt?.status === PaymentAttemptStatus.FAILED) {
            console.log(`[Webhook] Already processed failure for order ${orderId} — skipping`);
            return;
        }

        await paymentAttemptService.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.FAILED,
            paymentIntent.id,
            { error: paymentIntent.last_payment_error }
        );

        // Atomic: if restoreStock fails, the status update rolls back
        // and Stripe retries the webhook cleanly.
        await prisma.$transaction(async (tx) => {
            await orderService.updateOrderStatus(
                { orderId, newOrderStatus: OrderStatusKey.CANCELED },
                tx
            );

            await menuItemService.restoreStock(orderId, tx);
        });

        console.log(`[Webhook] Order ${orderId} canceled due to payment failure.`);
    }
}

export const stripeWebhookController = new StripeWebhookController();
