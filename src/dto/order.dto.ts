import { CartItemWithMenuItem } from "../types/cartItemWithMenuItem.type";
import { OrderStatus } from "../enums/orderStatus.enum";

export type FindOrdersByIdDto = {
    orderId: string;
}

export type CreateOrderDto = {
  customerId: string;
  restaurantId: string;
  cartItems: CartItemWithMenuItem[];
  status: OrderStatus;
};

export type UpdateOrderStatusDto = {
  orderId: string;
  newOrderStatus: OrderStatus;
};