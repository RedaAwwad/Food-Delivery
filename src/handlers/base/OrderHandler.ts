import { OrderContext } from "../../types/OrderContext";

/**
 * Abstract base class for all order processing handlers.
 * Implements the Chain of Responsibility pattern.
 * 
 * 🔗 CHAIN OF RESPONSIBILITY PATTERN EXPLAINED:
 * 
 * Think of this like a relay race:
 * - Each handler is a runner
 * - The context is the baton being passed
 * - Each runner does their part, then passes the baton to the next runner
 * 
 * Example chain:
 * [LockCart] → [ValidateCart] → [CheckInventory] → [CreateOrder] → ...
 * 
 * Each handler:
 * 1. Does its specific job (in the handle() method)
 * 2. Passes control to the next handler (via execute())
 * 3. Returns the final result when the chain is complete
 */
export abstract class OrderHandler {
    /**
     * Stores a reference to the next handler in the chain.
     * 
     * Think of this like a linked list:
     * - Each node (handler) points to the next node
     * - This creates a chain: handler1 → handler2 → handler3 → ...
     * 
     * Example:
     * lockCart.nextHandler = validateCart
     * validateCart.nextHandler = checkInventory
     * checkInventory.nextHandler = createOrder
     */
    private nextHandler?: OrderHandler;

    /**
     * Sets the next handler in the chain.
     * 
     * This method does TWO things:
     * 1. Connects this handler to the next one (like linking train cars)
     * 2. Returns the next handler so we can chain multiple setNext() calls
     * 
     * @param handler The next handler to execute after this one
     * @returns The next handler (for method chaining)
     * 
     * @example
     * // Instead of writing this:
     * lockCart.setNext(validateCart);
     * validateCart.setNext(checkInventory);
     * 
     * // We can write this (cleaner):
     * lockCart
     *   .setNext(validateCart)
     *   .setNext(checkInventory);
     * 
     * Why? Because setNext() returns the handler, so we can keep calling setNext() on it!
     */
    public setNext(handler: OrderHandler): OrderHandler {
        this.nextHandler = handler;
        return handler; // 👈 Return the handler so we can chain .setNext() calls
    }

    /**
     * Executes this handler's logic and passes control to the next handler.
     * 
     * This is the CORE of the Chain of Responsibility pattern!
     * 
     * Here's what happens step-by-step:
     * 1. Execute THIS handler's specific logic (by calling handle())
     * 2. Check if there's a next handler in the chain
     * 3. If yes: call execute() on the next handler (recursive!)
     * 4. If no: we're done! Return the context with all the accumulated data
     * 
     * @param context The order context containing all processing data
     * @returns The context after all handlers have processed it
     * 
     * @example
     * // When you call chain.execute(context):
     * 
     * LockCartHandler.execute(context)
     *   ↓ calls this.handle() → locks the cart
     *   ↓ has nextHandler? YES
     *   ↓ calls nextHandler.execute(context)
     *       ↓ ValidateCartHandler.execute(context)
     *           ↓ calls this.handle() → validates cart
     *           ↓ has nextHandler? YES
     *           ↓ calls nextHandler.execute(context)
     *               ↓ CheckInventoryHandler.execute(context)
     *                   ↓ ... and so on until the last handler
     */
    public async execute(context: OrderContext): Promise<OrderContext> {
        // Step 1: Do MY specific job
        // Each handler implements their own handle() method
        await this.handle(context);

        // Step 2: Is there a next handler in the chain?
        if (this.nextHandler) {
            // Step 3: Yes! Pass control to the next handler
            // This is RECURSIVE - the next handler will call execute() on ITS next handler
            return this.nextHandler.execute(context);
        }

        // Step 4: No more handlers! We're at the end of the chain
        // Return the context with all the data from all handlers
        return context;
    }

    /**
     * Abstract method that must be implemented by concrete handlers.
     * Contains the specific logic for this handler.
     * 
     * 🎯 WHY IS THIS ABSTRACT?
     * 
     * Because each handler does something DIFFERENT:
     * - LockCartHandler.handle() → locks the cart
     * - ValidateCartHandler.handle() → validates cart items
     * - ProcessPaymentHandler.handle() → processes payment
     * 
     * By making this abstract, we FORCE each handler to implement its own logic.
     * This is the "Single Responsibility Principle" in action!
     * 
     * @param context The order context
     * 
     * @example
     * // In LockCartHandler:
     * protected async handle(context: OrderContext): Promise<void> {
     *   await cartRepository.lockCart(context.customerId);
     *   context.isCartLocked = true;
     * }
     * 
     * // In ValidateCartHandler:
     * protected async handle(context: OrderContext): Promise<void> {
     *   const cartItems = await cartRepository.getCartItems(context.customerId);
     *   if (cartItems.length === 0) throw new Error("Cart is empty");
     *   context.cartItems = cartItems;
     * }
     */
    protected abstract handle(context: OrderContext): Promise<void>;
}
