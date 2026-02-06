import { PaymentStrategyFactory } from './payment/PaymentStrategyFactory';
import { preferredPaymentSettingsService } from './PreferredPaymentSettingsService';
import { UnprocessableEntityError, InternalServerError } from '../utils/errors/error-factories';
import { PaymentResult } from './payment/strategies/IPaymentStrategy';
import { ErrorDetails } from '../utils/errors/error.types';
import { CustomError } from '../utils/errors';

export class PaymentService {
    async processPayment(
        customerId: string,
        amount: number,
        idempotencyKey: string,
        requestTimestamp: Date
    ): Promise<PaymentResult> {
        // 1. Get customer's preferred payment settings
        const settings = await preferredPaymentSettingsService.getCustomerSettings(customerId);

        if (!settings || !settings.paymentMethods || settings.paymentMethods.length === 0) {
            throw InternalServerError("No payment method found for customer");
        }

        // 2. Identify the preferred payment method
        const preferredMethod = settings.paymentMethods.find(
            pm => pm.paymentMethodId === settings.paymentMethodId
        );

        if (!preferredMethod) {
            throw InternalServerError("Preferred payment method not set or not found");
        }

        // 3. Extract provider from payment method data
        const provider = (preferredMethod.paymentMethodData as any)?.provider;

        if (!provider) {
            throw UnprocessableEntityError("Payment method configuration missing provider");
        }

        // 4. Get specific strategy from Factory
        const strategy = PaymentStrategyFactory.getStrategy(provider);

        // 5. Execute payment
        try {
            return await strategy.process(
                amount,
                { ...preferredMethod.paymentMethodData as any, requestTimestamp },
                idempotencyKey
            );
        } catch (error: any) {
            console.error(`Payment failed for customer ${customerId}:`, error);
            // Re-throw or wrap? For now, we wrap non-custom errors as 500
            if (error instanceof CustomError) {
                throw error;
            }
            throw InternalServerError("Failed to place order", error);
        }
    }
}

export const paymentService = new PaymentService();
