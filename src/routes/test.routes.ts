import express from 'express';
import stripe from '../utils/payment/stripe';
import { prisma } from '../config/prisma.config';
import { orderRepository } from '../repositories/order.repository';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';
import { cartService } from '../services/cart.service';
import { PaymentAttemptStatus, OrderStatusKey } from '../generated/prisma/client';

const testRouter = express.Router();

/**
 * GET /test/login
 * Simple login form — stores the accessToken in sessionStorage.
 */
testRouter.get('/login', (_req, res) => {
    res.render('login');
});

/**
 * GET /test/checkout
 * Full checkout + Stripe payment page.
 * Injects the publishable key from the server so it's never hardcoded in the template.
 */
testRouter.get('/checkout', (_req, res) => {
    res.render('checkout', {
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    });
});

/**
 * POST /test/reconcile-order
 * DEV ONLY — manually reconciles an order whose webhook was never delivered.
 *
 * Body: { orderId: string }
 *
 * 1. Finds the PaymentAttempt for the order to get the Stripe PaymentIntent ID.
 * 2. Fetches the PaymentIntent from Stripe to verify it genuinely succeeded.
 * 3. Runs the same logic as the webhook handler: marks COMPLETED + SUCCESS.
 */
testRouter.post('/reconcile-order', async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        res.status(400).json({ error: 'orderId is required' });
        return;
    }

    try {
        const idempotencyKey = `order_${orderId}`;
        const attempt = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);

        if (!attempt) {
            res.status(404).json({ error: `No PaymentAttempt found for order ${orderId}` });
            return;
        }

        if (attempt.status === PaymentAttemptStatus.SUCCESS) {
            res.json({ message: 'Already reconciled — order is already SUCCESS.', orderId });
            return;
        }

        if (!attempt.transactionId) {
            res.status(400).json({ error: 'No transactionId (PaymentIntent ID) on this attempt — cannot verify with Stripe.' });
            return;
        }

        // Verify with Stripe that the PaymentIntent actually succeeded
        const paymentIntent = await stripe.paymentIntents.retrieve(attempt.transactionId);

        if (paymentIntent.status !== 'succeeded') {
            res.status(400).json({
                error: `PaymentIntent is not succeeded in Stripe (status: ${paymentIntent.status}). Cannot reconcile.`
            });
            return;
        }

        const { customerId } = paymentIntent.metadata as { customerId: string };

        // Run same logic as webhook handler
        await prisma.$transaction(async (tx) => {
            await orderRepository.updateOrderStatus(
                { orderId, newOrderStatus: OrderStatusKey.COMPLETED },
                tx
            );
            await paymentAttemptRepository.updateStatus(
                idempotencyKey,
                PaymentAttemptStatus.SUCCESS,
                paymentIntent.id,
                { amount: paymentIntent.amount / 100, reconciledManually: true }
            );
            if (customerId) {
                await cartService.clearCart(customerId, tx);
            }
        });

        // Finalize cart-level attempt too
        const order = await orderRepository.findOrderById(orderId);
        const cartKey = `cart_${customerId}_${order.restaurantId}`;
        const cartAttempt = await paymentAttemptRepository.findByIdempotencyKey(cartKey);
        if (cartAttempt && cartAttempt.status === PaymentAttemptStatus.PENDING) {
            await paymentAttemptRepository.updateStatus(
                cartKey,
                PaymentAttemptStatus.SUCCESS,
                paymentIntent.id,
                { finalizedBy: 'manual-reconcile', orderId }
            );
        }

        console.log(`[Reconcile] Order ${orderId} manually reconciled as COMPLETED.`);
        res.json({ success: true, message: `Order ${orderId} reconciled as COMPLETED.`, paymentIntentId: paymentIntent.id });

    } catch (err: any) {
        console.error('[Reconcile] Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

export { testRouter };

