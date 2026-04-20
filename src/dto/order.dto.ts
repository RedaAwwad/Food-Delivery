import { CartItemSummary } from "../types/CartItemSummary";
import { OrderStatusKey } from "../generated/prisma/enums";

export type FindOrdersByIdDto = {
  orderId: string;
}

export type CreateOrderDto = {
  customerId: string;
  restaurantId: string;
  cartItems: CartItemSummary[];
  orderStatus: OrderStatusKey;
};

export type UpdateOrderStatusDto = {
  orderId: string;
  newOrderStatus: OrderStatusKey;
};