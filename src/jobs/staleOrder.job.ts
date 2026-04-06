import cron from 'node-cron';
import stripe from '../utils/payment/stripe';
import { orderRepository } from '../repositories/order.repository';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';
import { menuItemService } from '../services/menuItem.service';
import { OrderStatusKey, PaymentAttemptStatus } from '../generated/prisma/client';

const STALE_THRESHOLD_MINUTES = 30;
const CRON_SCHEDULE = '*/5 * * * *'; // every 5 minutes

/**
 * Finds PENDING orders older than 30 minutes and cancels them.
 *
 * This handles the case where a customer placed an order but never completed payment
 * (closed the browser, lost connection, etc.).
 *
 * Steps per stale order:
 *  1. Cancel the Stripe PaymentIntent (so the reserved funds are released)
 *  2. Mark the order as CANCELED
 *  3. Mark the PaymentAttempt as FAILED
 *  4. Restore inventory
 */
export function startStaleOrderJob() {
    cron.schedule(CRON_SCHEDULE, async () => {
        console.log('[StaleOrderJob] Checking for stale PENDING orders...');

        try {
            const cutoff = new Date(Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000);

            const staleOrders = await orderRepository.findStaleOrders({
                status: OrderStatusKey.PENDING,
                createdBefore: cutoff,
            });

            if (staleOrders.length === 0) {
                console.log('[StaleOrderJob] No stale orders found.');
                return;
            }

            console.log(`[StaleOrderJob] Found ${staleOrders.length} stale orders. Processing...`);

            for (const order of staleOrders) {
                try {
                    await processStaleOrder(order.orderId);
                } catch (err: any) {
                    // Log per-order errors but continue with the rest
                    console.error(`[StaleOrderJob] Failed to process order ${order.orderId}:`, err.message);
                }
            }
        } catch (err: any) {
            console.error('[StaleOrderJob] Job failed:', err.message);
        }
    });

    console.log(`[StaleOrderJob] Started — runs every 5 minutes, cancels PENDING orders > ${STALE_THRESHOLD_MINUTES} min old`);
}

async function processStaleOrder(orderId: string) {
    console.log(`[StaleOrderJob] Cancelling stale order: ${orderId}`);

    // 1. Cancel PaymentIntent in Stripe (if one was created)
    const attempt = await paymentAttemptRepository.findByIdempotencyKey(`order_${orderId}`);
    if (attempt?.transactionId && attempt.status === PaymentAttemptStatus.PENDING) {
        try {
            await stripe.paymentIntents.cancel(attempt.transactionId);
            console.log(`[StaleOrderJob] Cancelled Stripe PaymentIntent: ${attempt.transactionId}`);
        } catch (stripeErr: any) {
            // PaymentIntent may already be cancelled or succeeded — ignore
            console.warn(`[StaleOrderJob] Could not cancel PaymentIntent ${attempt.transactionId}: ${stripeErr.message}`);
        }
    }

    // 2. Mark order as CANCELED
    await orderRepository.updateOrderStatus({
        orderId,
        newOrderStatus: OrderStatusKey.CANCELED,
    });

    // 3. Mark PaymentAttempt as FAILED
    if (attempt) {
        await paymentAttemptRepository.updateStatus(
            `order_${orderId}`,
            PaymentAttemptStatus.FAILED,
            attempt.transactionId ?? undefined,
            { reason: 'Stale order — cancelled by cron job' }
        );
    }

    // 4. Restore inventory
    await menuItemService.restoreStock(orderId);

    console.log(`[StaleOrderJob] Order ${orderId} cancelled and inventory restored.`);
}
