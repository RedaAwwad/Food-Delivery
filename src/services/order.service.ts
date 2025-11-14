import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/errors/custom-error";
import { orderRepository } from "../repositories/order.repository";
import { OrderStatus } from "@prisma-client";
import { cartRepository } from "../repositories/cart.repository";
import { inventoryRepository } from "../repositories/inventory.repository";
import { paymentService } from "./payment.service";

class OrderService {
  async getAllOrders() {
    return await orderRepository.findAllOrders();
  }

  async getOrderById(orderId: number) {
    return orderRepository.findOrderById(orderId);
  }

  async updateStatus(orderId: number, status: OrderStatus) {
    // datetime on service layer
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw new CustomError({
        message: "The order not found",
        statusCode: StatusCodes.NOT_FOUND,
      });
    }
    // audit on entity level (updatedBy, updatedOn) when update the status
    const updateOrder = await orderRepository.updateStatus(orderId, status);
    return updateOrder;
  }

  async placeOrder(customerId: number, restaurantId: number) {
    await cartRepository.lockCart(customerId);

    try {
      // What happend in place order
      //* move cart items to order --> Lock Cart is_locked */
      //* items availability check
      //* reduce cart items from inventory
      //* create order record with status 'Pending'
      //* payment process
      //* update order status to 'Confirmed' or 'Payment Failed'
      //* unlock cart is_locked = false

      // lockCart(); -- is_locked = true
      // getCartItemsByCustomerId(customerId);
      // inventoryCheck();
      // reduceInventory();
      // createOrderRecord();
      // paymentProcess();
      // updateOrderStatus();
      // unlockCart();

      /** maintainability , extendable ,
       * testability , Follow SOLID ,
       * Design Pattern (chain of responsibility) */

      //* async send notification to restaurant
      //* async send notification to customer
      //* async audit log who placed the order and when (createdBy, createdOn)

      const cartItems = await cartRepository.getCartItemsByCustomerId(customerId);
      if (cartItems.length === 0) {
        throw new CustomError({
          message: "Cart is empty. Cannot place an order.",
          statusCode: StatusCodes.BAD_REQUEST,
        });
      }

      await inventoryRepository.checkItemsAvailability(cartItems);

      // The following operations should be atomic.
      // 1. Create the order record.
      // 2. Reduce stock from inventory.
      // 3. Clear the user's cart.
      // These are wrapped in a transaction inside `createOrder`.
      const order = await orderRepository.createOrder(
        {
          customerId,
          restaurantId,
          cartItems,
          status: OrderStatus.PENDING, // Start as PENDING
        }
      );

      const paymentResult = await paymentService.processPayment(
        customerId,
        order.totalAmount
      );

      let finalOrder;
      if (paymentResult.success) {
        // Payment was successful, confirm the order and reduce stock.
        finalOrder = await orderRepository.updateStatus(order.id, OrderStatus.CONFIRMED);
        // These operations should ideally be part of a transaction with order creation.
        // Assuming createOrder doesn't handle inventory and cart clearing, we do it here.
        // For better atomicity, consider moving these into a transactional repository method.
        await inventoryRepository.reduceStock(cartItems);
        await cartRepository.clearCartByCustomerId(customerId);
      } else {
        // Payment failed, update the order status accordingly.
        finalOrder = await orderRepository.updateStatus(
          order.id,
          OrderStatus.PAYMENT_FAILED
        );
      }

      return finalOrder;

    } catch (err: any) {
      // Re-throw custom errors, wrap others
      if (err instanceof CustomError) {
        throw err;
      }
      throw new CustomError({
        message: err.message || "Failed to place order",
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    } finally {
      // 8. Always unlock the cart, regardless of success or failure.
      await cartRepository.unlockCart(customerId);
    }
  }
}

export const orderService = new OrderService();
