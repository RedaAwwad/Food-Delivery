import { PaymentStrategyFactory } from './payment/PaymentStrategyFactory';
import { preferredPaymentSettingsService } from './PreferredPaymentSettingsService';
import { paymentAttemptService } from './PaymentAttemptService';
import { PaymentAttemptStatus } from '../generated/prisma/client';
import { UnprocessableEntityError, InternalServerError } from '../utils/errors/error-factories';
import { PaymentResult } from './payment/strategies/IPaymentStrategy';
import { CustomError } from '../utils/errors';
import { prisma } from '../config/prisma.config';
import stripe from '../utils/payment/stripe';

export class PaymentService {

    /**
     * Uses the unified processPayment across all strategies.
      
     * Idempotency layers:
     *  1. DB — check PaymentAttempt before calling strategy
     *  2. Strategy — idempotencyKey passed to gateway (e.g. Stripe)
     */
    async processPayment(
        customerId: string,
        orderId: string,
        amount: number,
        email: string,
        restaurantId: string,
        requestTimestamp: Date,
        paymentProvider?: string,
        paymentMethodId?: string
    ): Promise<PaymentResult> {
        const idempotencyKey = `order_${orderId}`;

        // --- Layer 1: DB-level idempotency guard ---
        const existing = await paymentAttemptService.findAttempt(idempotencyKey);
        if (existing) {
            if (existing.status === PaymentAttemptStatus.SUCCESS) {
                throw UnprocessableEntityError("Order has already been paid");
            }
            if (existing.status === PaymentAttemptStatus.PENDING) {
                const responseData = existing.responseData as any;
                if (responseData?.clientSecret && existing.transactionId) {
                    // In-flight — return the saved clientSecret, do NOT create a new intent
                    console.log(`[PaymentService] Returning existing PENDING PaymentIntent for order ${orderId}`);
                    return {
                        success: true,
                        clientSecret: responseData.clientSecret,
                        transactionId: existing.transactionId,
                        requiresAction: true,
                    };
                }
            }
        }

        // --- Resolve payment provider and method ---
        let finalProvider = paymentProvider;
        let finalMethodId = paymentMethodId;
        let providerData: any = {};

        // If a specific saved method was selected, fetch it from DB
        if (paymentMethodId && !paymentProvider) {
            const method = await prisma.paymentMethod.findUnique({
                where: { paymentMethodId }
            });
            if (!method) throw UnprocessableEntityError("Selected payment method not found");
            const data = method.paymentMethodData as any;
            finalProvider = data.provider;
            providerData = data;
        } 
        // If neither was explicitly passed, fallback to user's preferred settings
        else if (!paymentProvider && !paymentMethodId) {
            const settings = await preferredPaymentSettingsService.getCustomerSettings(customerId);
            const preferredMethod = settings?.paymentMethods?.find(
                pm => pm.paymentMethodId === settings.paymentMethodId
            );

            if (preferredMethod) {
                const data = preferredMethod.paymentMethodData as any;
                finalProvider = data.provider;
                providerData = data;
                finalMethodId = preferredMethod.paymentMethodId;
            } else {
                // If user has no preferred settings and didn't pass a provider, default to Stripe Elements
                finalProvider = 'stripe';
            }
        }

        if (!finalProvider) {
            throw UnprocessableEntityError("Unable to determine payment provider");
        }

        const strategy = PaymentStrategyFactory.getStrategy(finalProvider);

        // --- Record/reset PENDING attempt BEFORE calling API ---
        await paymentAttemptService.upsertPendingAttempt(idempotencyKey, orderId, finalProvider, requestTimestamp);

        // --- Layer 2: API idempotency ---
        try {
            const result = await strategy.processPayment(
                amount,
                { orderId, customerId, restaurantId, email, savedMethodData: providerData },
                idempotencyKey
            );

            if (result.requiresAction) {
                // Keep PENDING, save clientSecret for retries. Webhook will set to AUTHORIZED.
                await paymentAttemptService.updateStatus(
                    idempotencyKey,
                    PaymentAttemptStatus.PENDING,
                    result.transactionId,
                    { clientSecret: result.clientSecret }
                );
            } else {
                // Fully synchronous success (e.g. COD).
                await paymentAttemptService.updateStatus(
                    idempotencyKey,
                    PaymentAttemptStatus.SUCCESS,
                    result.transactionId,
                    { message: result.message }
                );
            }

            return result;
        } catch (error: any) {
            console.error(`Payment failed for customer ${customerId}:`, error);
            if (error instanceof CustomError) throw error;
            throw InternalServerError("Payment processing failed", error);
        }
    }

    async capturePayment(orderId: string, amount?: number): Promise<void> {
        const idempotencyKey = `order_${orderId}`;
        const attempt = await paymentAttemptService.findAttempt(idempotencyKey);

        if (!attempt) throw new CustomError({ statusCode: 404, message: `No payment attempt for order ${orderId}` });
        if (attempt.status === PaymentAttemptStatus.SUCCESS) {
            return; // Already captured
        }
        if (attempt.status !== PaymentAttemptStatus.AUTHORIZED) {
            throw new CustomError({ statusCode: 400, message: `Cannot capture payment in status ${attempt.status}` });
        }
        if (!attempt.transactionId) throw InternalServerError("Missing transactionId for capture");

        const strategy = PaymentStrategyFactory.getStrategy(attempt.provider);
        await strategy.capturePayment(attempt.transactionId, amount);
        
        await paymentAttemptService.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.SUCCESS,
            attempt.transactionId,
            { capturedAt: new Date().toISOString() }
        );
    }

    /**
     * Voids an AUTHORIZED hold. Called by OrderService during cancellation.
     * Keeps the Stripe interaction inside the Payment domain.
     */
    async voidHold(orderId: string): Promise<void> {
        const idempotencyKey = `order_${orderId}`;
        const attempt = await paymentAttemptService.findAttempt(idempotencyKey);

        if (!attempt || attempt.status !== PaymentAttemptStatus.AUTHORIZED || !attempt.transactionId) return;

        await stripe.paymentIntents.cancel(attempt.transactionId);

        await paymentAttemptService.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.FAILED,
            attempt.transactionId,
            { error: 'Hold voided due to cancellation' }
        );
    }
}

export const paymentService = new PaymentService();
