import { CartItemWithMenuItem } from "./cartItemWithMenuItem.type";
import { PrismaTx } from "./prisma.types";

export interface OrderContext {
    // Input data
    customerId: string;
    restaurantId: string;
    tx?: PrismaTx;

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
