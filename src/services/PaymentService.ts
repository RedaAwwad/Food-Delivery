import { PaymentStrategyFactory } from './payment/PaymentStrategyFactory';
import { preferredPaymentSettingsService } from './PreferredPaymentSettingsService';
import { paymentAttemptService } from './PaymentAttemptService';
import { paymentAttemptRepository } from '../repositories/PaymentAttemptRepository';
import { PaymentAttemptStatus } from '../generated/prisma/client';
import { UnprocessableEntityError, InternalServerError } from '../utils/errors/error-factories';
import { PaymentIntentResult, PaymentResult } from './payment/strategies/IPaymentStrategy';
import { CustomError } from '../utils/errors';
import { prisma } from '../config/prisma.config';

export class PaymentService {

    /**
     * Creates a Stripe PaymentIntent for an already-created (PENDING) order.
     *
     * Idempotency layers:
     *  1. DB — check PaymentAttempt before calling Stripe
     *  2. Stripe — idempotencyKey on paymentIntents.create()
     */
    async createPaymentIntent(
        customerId: string,
        orderId: string,
        amount: number,
        email: string,
        restaurantId: string,
        requestTimestamp: Date,
        paymentProvider?: string,
        paymentMethodId?: string
    ): Promise<PaymentIntentResult> {
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
                        clientSecret: responseData.clientSecret,
                        paymentIntentId: existing.transactionId,
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
        // Using upsert so a retry after a failed Stripe call resets the attempt
        // instead of crashing on a duplicate idempotencyKey.
        await paymentAttemptService.upsertPendingAttempt(idempotencyKey, orderId, finalProvider, requestTimestamp);

        // --- Layer 2: API idempotency ---
        const result = await strategy.createPaymentIntent(
            amount,
            { orderId, customerId, restaurantId, email, savedMethodData: providerData },
            idempotencyKey
        );

        // Store clientSecret (still PENDING) so retries can return it without re-calling Stripe
        await paymentAttemptRepository.updateStatus(
            idempotencyKey,
            PaymentAttemptStatus.PENDING,    // keep PENDING — webhook will set SUCCESS
            result.paymentIntentId,
            { clientSecret: result.clientSecret }
        );

        return result;
    }

    /**
     * Legacy synchronous flow — Cash on Delivery, direct charge strategies.
     */
    async processPayment(
        customerId: string,
        amount: number,
        idempotencyKey: string,
        requestTimestamp: Date
    ): Promise<PaymentResult> {
        const settings = await preferredPaymentSettingsService.getCustomerSettings(customerId);

        if (!settings || !settings.paymentMethods || settings.paymentMethods.length === 0) {
            throw InternalServerError("No payment method found for customer");
        }

        const preferredMethod = settings.paymentMethods.find(
            pm => pm.paymentMethodId === settings.paymentMethodId
        );

        if (!preferredMethod) throw InternalServerError("Preferred payment method not set or not found");

        const provider = (preferredMethod.paymentMethodData as any)?.provider;
        if (!provider) throw UnprocessableEntityError("Payment method configuration missing provider");

        const strategy = PaymentStrategyFactory.getStrategy(provider);

        try {
            return await strategy.process(
                amount,
                { ...preferredMethod.paymentMethodData as any, requestTimestamp },
                idempotencyKey
            );
        } catch (error: any) {
            console.error(`Payment failed for customer ${customerId}:`, error);
            if (error instanceof CustomError) throw error;
            throw InternalServerError("Payment processing failed", error);
        }
    }
}

export const paymentService = new PaymentService();
