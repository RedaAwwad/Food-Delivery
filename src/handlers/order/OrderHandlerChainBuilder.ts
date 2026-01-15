import { OrderHandler } from "./base/OrderHandler";
import { LockCartHandler } from "./LockCartHandler";
import { CreateOrderHandler } from "./CreateOrderHandler";
import { ClearCartHandler } from "./ClearCartHandler";
import { NotifyRestaurantHandler } from "./NotifyRestaurantHandler";
import { NotifyCustomerHandler } from "./NotifyCustomerHandler";
import { AuditLogHandler } from "./AuditLogHandler";
import { ReduceInventoryHandler } from "./ReduceInventoryHandler";
import { CheckInventoryHandler } from "./CheckInventoryHandler";
import { ValidateCartHandler } from "./ValidateCartHandler";
import { ProcessPaymentHandler } from "./ProcessPaymentHandler";
import { UpdateOrderStatusHandler } from "./UpdateOrderStatusHandler";
import { UnlockCartHandler } from "./UnlockCartHandler";

export class OrderHandlerChainBuilder {

    public static build(): OrderHandler {

        const lockCart = new LockCartHandler();
        const validateCart = new ValidateCartHandler();
        const checkInventory = new CheckInventoryHandler();
        const createOrder = new CreateOrderHandler();
        const processPayment = new ProcessPaymentHandler();
        const updateOrderStatus = new UpdateOrderStatusHandler();
        const reduceInventory = new ReduceInventoryHandler();
        const clearCart = new ClearCartHandler();
        const notifyRestaurant = new NotifyRestaurantHandler();
        const notifyCustomer = new NotifyCustomerHandler();
        const auditLog = new AuditLogHandler();
        const unlockCart = new UnlockCartHandler();

        lockCart
            .setNext(validateCart)
            .setNext(checkInventory)
            .setNext(createOrder)
            .setNext(processPayment)
            .setNext(updateOrderStatus)
            .setNext(reduceInventory)
            .setNext(clearCart)
            .setNext(notifyRestaurant)
            .setNext(notifyCustomer)
            .setNext(auditLog)
            .setNext(unlockCart);

        return lockCart;
    }
}
