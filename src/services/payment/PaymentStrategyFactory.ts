import { IPaymentStrategy } from './strategies/IPaymentStrategy';
import { StripeStrategy } from './strategies/StripeStrategy';
import { PayPalStrategy } from './strategies/PayPalStrategy';
import { AmadeusStrategy } from './strategies/AmadeusStrategy';
import { CashOnDeliveryStrategy } from './strategies/CashOnDeliveryStrategy';
import { BadRequestError } from '../../utils/errors/error-factories';

export class PaymentStrategyFactory {
    static getStrategy(provider: string): IPaymentStrategy {
        switch (provider.toUpperCase()) {
            case 'STRIPE':
                return new StripeStrategy();
            case 'PAYPAL':
                return new PayPalStrategy();
            case 'AMADEUS':
                return new AmadeusStrategy();
            case 'CASH_ON_DELIVERY':
                return new CashOnDeliveryStrategy();
            default:
                throw BadRequestError(`Unsupported payment provider: ${provider}`);
        }
    }
}
