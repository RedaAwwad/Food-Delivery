import { OrderHandler } from "./base/OrderHandler";
import { LockCartHandler } from "./LockCartHandler";
import { ValidateCartHandler } from "./ValidateCartHandler";
import { CheckInventoryHandler } from "./CheckInventoryHandler";
import { CreateOrderHandler } from "./CreateOrderHandler";
import { ProcessPaymentHandler } from "./ProcessPaymentHandler";
import { UpdateOrderStatusHandler } from "./UpdateOrderStatusHandler";
import { ReduceInventoryHandler } from "./ReduceInventoryHandler";
import { ClearCartHandler } from "./ClearCartHandler";
import { NotifyRestaurantHandler } from "./NotifyRestaurantHandler";
import { NotifyCustomerHandler } from "./NotifyCustomerHandler";
import { AuditLogHandler } from "./AuditLogHandler";
import { UnlockCartHandler } from "./UnlockCartHandler";

export class OrderHandlerChainBuilder {

    public static build(): OrderHandler {

        const lockCart = new LockCartHandler();              // Worker 1: Locks the cart
        const validateCart = new ValidateCartHandler();      // Worker 2: Validates cart items
        const checkInventory = new CheckInventoryHandler();  // Worker 3: Checks inventory
        const createOrder = new CreateOrderHandler();        // Worker 4: Creates the order
        const processPayment = new ProcessPaymentHandler();  // Worker 5: Processes payment
        const updateOrderStatus = new UpdateOrderStatusHandler(); // Worker 6: Updates order status
        const reduceInventory = new ReduceInventoryHandler(); // Worker 7: Reduces inventory
        const clearCart = new ClearCartHandler();            // Worker 8: Clears the cart
        const notifyRestaurant = new NotifyRestaurantHandler(); // Worker 9: Notifies restaurant
        const notifyCustomer = new NotifyCustomerHandler();  // Worker 10: Notifies customer
        const auditLog = new AuditLogHandler();              // Worker 11: Logs audit info
        const unlockCart = new UnlockCartHandler();          // Worker 12: Unlocks the cart

        lockCart
            .setNext(validateCart)       // Connect lockCart → validateCart
            .setNext(checkInventory)     // Connect validateCart → checkInventory
            .setNext(createOrder)        // Connect checkInventory → createOrder
            .setNext(processPayment)     // Connect createOrder → processPayment
            .setNext(updateOrderStatus)  // Connect processPayment → updateOrderStatus
            .setNext(reduceInventory)    // Connect updateOrderStatus → reduceInventory
            .setNext(clearCart)          // Connect reduceInventory → clearCart
            .setNext(notifyRestaurant)   // Connect clearCart → notifyRestaurant
            .setNext(notifyCustomer)     // Connect notifyRestaurant → notifyCustomer
            .setNext(auditLog)           // Connect notifyCustomer → auditLog
            .setNext(unlockCart);        // Connect auditLog → unlockCart (last one!)

        return lockCart; // 👈 Return the FIRST handler in the chain (the entry point) 
    }
}
