import { CartItemWithMenuItem } from "./cartItemWithMenuItem.type";

export interface OrderContext {
    // Input data
    customerId: string;
    restaurantId: string;

    // Data populated during chain execution
    cartItems?: CartItemWithMenuItem[];
    order?: any; // The created order
    paymentResult?: {
        success: boolean;
        transactionId?: string;
    };
    finalOrder?: any; // The final order state

    // Metadata
    errors?: string[];
    isCartLocked?: boolean;
    shouldReduceInventory?: boolean;
    shouldClearCart?: boolean;
}
