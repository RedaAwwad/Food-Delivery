import { CartItemWithMenuItem } from "../types/cartItemWithMenuItem.type";
import { OrderStatusKey } from "../generated/prisma";

export type FindOrdersByIdDto = {
    orderId: string;
}

export type CreateOrderDto = {
  customerId: string;
  restaurantId: string;
  cartItems: CartItemWithMenuItem[];
  orderStatus: OrderStatusKey;
};

export type UpdateOrderStatusDto = {
  orderId: string;
  newOrderStatus: OrderStatusKey;
};