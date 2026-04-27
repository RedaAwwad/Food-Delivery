import { CartItemSummary } from "./CartItemSummary";
import { PrismaTx } from "./prisma.types";

export interface OrderContext {
    // Input data
    customerId: string;
    restaurantId: string;
    customerEmail: string;       // required for Stripe customer creation
    requestTimestamp: Date;
    paymentProvider?: string | undefined;    // 'stripe', 'paypal', 'amadeus', 'cod'
    paymentMethodId?: string | undefined;    // ID of a saved payment method
    tx?: PrismaTx;

    // Data populated during chain execution
    cartItems?: CartItemSummary[];
    order?: any;                 // The created PENDING order
    paymentResult?: {
        success: boolean;
        transactionId?: string;
    };
    clientSecret?: string;       // Stripe clientSecret returned to the API caller
    finalOrder?: any;            // The final order state

    // Metadata
    errors?: string[];
    isCartLocked?: boolean;
    shouldReduceInventory?: boolean;
    shouldClearCart?: boolean;
    shouldUpdateOrderStatus?: boolean;
}
