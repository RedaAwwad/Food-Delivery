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
import { ParallelOrderHandler } from "./ParallelOrderHandler";

export class OrderHandlerChainBuilder {

    /**
     * Phase A: DB Transaction Chain
     * Runs inside the Prisma transaction.
     */
    public static buildCreationChain(): OrderHandler {
        const lockCart = new LockCartHandler();
        const validateCart = new ValidateCartHandler();
        const checkInventory = new CheckInventoryHandler();
        const createOrder = new CreateOrderHandler();
        const reduceInventory = new ReduceInventoryHandler();
        const unlockCart = new UnlockCartHandler();
        const notifyRestaurant = new NotifyRestaurantHandler();
        const notifyCustomer = new NotifyCustomerHandler();
        const auditLog = new AuditLogHandler();

        const parallelHandler = new ParallelOrderHandler([
            notifyRestaurant,
            notifyCustomer,
            auditLog
        ]);

        lockCart
            .setNext(validateCart)
            .setNext(checkInventory)
            .setNext(createOrder)
            .setNext(reduceInventory)
            .setNext(unlockCart)
            .setNext(parallelHandler);

        return lockCart;
    }

    /**
     * Phase B: External API Call
     * Runs AFTER the Prisma transaction successfully commits.
     */
    public static buildPostCreationChain(): OrderHandler {
        const processPayment = new ProcessPaymentHandler();
        const updateOrderStatus = new UpdateOrderStatusHandler();
        const clearCart = new ClearCartHandler();

        processPayment
            .setNext(updateOrderStatus)
            .setNext(clearCart);

        return processPayment;
    }
}
