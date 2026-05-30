import stripe from "../utils/payment/stripe";
import { prisma } from "../config/prisma.config";
import { orderRepository } from "../repositories/order.repository";
import { paymentAttemptRepository } from "../repositories/PaymentAttemptRepository";
import { cartService } from "./cart.service";
import { PaymentAttemptStatus, OrderStatusKey } from "../generated/prisma/client";
import { BadRequestError, NotFoundError } from "../utils/errors";

/**
 * Finalize a succeeded Stripe PaymentIntent: COMPLETED order + SUCCESS attempt + clear cart.
 * Used by the webhook and by POST /orders/confirm-payment (storefront after card confirm).
 */
export async function finalizeStripePaymentSuccess(paymentIntent: {
  id: string;
  amount: number;
  metadata?: { orderId?: string; customerId?: string };
  payment_method?: string | null;
  customer?: string | null;
  setup_future_usage?: string | null;
}) {
  const orderId = paymentIntent.metadata?.orderId;
  const customerId = paymentIntent.metadata?.customerId;

  if (!orderId) {
    console.error("[StripeCompletion] missing orderId in PaymentIntent metadata", paymentIntent.id);
    throw BadRequestError("PaymentIntent missing orderId metadata");
  }

  const idempotencyKey = `order_${orderId}`;
  const attempt = await paymentAttemptRepository.findByIdempotencyKey(idempotencyKey);
  if (attempt?.status === PaymentAttemptStatus.SUCCESS) {
    console.log(`[StripeCompletion] Order ${orderId} already finalized`);
    return { orderId, alreadyCompleted: true };
  }

  await prisma.$transaction(async (tx) => {
    await orderRepository.updateOrderStatus(
      { orderId, newOrderStatus: OrderStatusKey.COMPLETED },
      tx
    );

    await paymentAttemptRepository.updateStatus(
      idempotencyKey,
      PaymentAttemptStatus.SUCCESS,
      paymentIntent.id,
      { amount: paymentIntent.amount / 100 }
    );

    if (customerId) {
      await cartService.clearCart(customerId, tx);
    }
  });

  if (customerId) {
    try {
      const order = await orderRepository.findOrderById(orderId);
      const cartKey = `cart_${customerId}_${order.restaurantId}`;
      const cartAttempt = await paymentAttemptRepository.findByIdempotencyKey(cartKey);
      if (cartAttempt && cartAttempt.status === PaymentAttemptStatus.PENDING) {
        await paymentAttemptRepository.updateStatus(
          cartKey,
          PaymentAttemptStatus.SUCCESS,
          paymentIntent.id,
          { finalizedBy: "stripe-completion", orderId }
        );
      }
    } catch (err: any) {
      console.warn(`[StripeCompletion] Could not finalize cart-level attempt:`, err.message);
    }
  }

  console.log(`[StripeCompletion] Order ${orderId} → COMPLETED (${paymentIntent.id})`);
  return { orderId, alreadyCompleted: false };
}

/** Verify PI with Stripe and finalize — for logged-in customer after frontend payment. */
export async function confirmStripePaymentForOrder(customerId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { orderId, customerId },
  });
  if (!order) throw NotFoundError("Order not found");

  if (order.orderStatus === OrderStatusKey.COMPLETED) {
    return { order, alreadyCompleted: true };
  }

  const attempt = await paymentAttemptRepository.findByIdempotencyKey(`order_${orderId}`);
  if (!attempt?.transactionId) {
    throw BadRequestError("No payment session found for this order");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(attempt.transactionId);

  if (paymentIntent.status !== "succeeded") {
    throw BadRequestError(`Payment not completed yet (status: ${paymentIntent.status})`);
  }

  if (paymentIntent.metadata?.orderId !== orderId) {
    throw BadRequestError("Payment does not match this order");
  }

  await finalizeStripePaymentSuccess({
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    metadata: {
      orderId: paymentIntent.metadata.orderId,
      customerId: paymentIntent.metadata.customerId || customerId,
    },
    payment_method: paymentIntent.payment_method as string | null,
    customer: paymentIntent.customer as string | null,
    setup_future_usage: paymentIntent.setup_future_usage,
  });

  const updated = await orderRepository.findOrderById(orderId);
  return { order: updated, alreadyCompleted: false };
}
