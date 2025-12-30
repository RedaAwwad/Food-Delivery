import { prisma } from "../config/prisma.config";
import { CreateOrderDto } from "../dto/createOrderDto";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";

// type CartItemWithMenuItem = CartItem & { menuItem: MenuItem };

class OrderRepository {
  async findAllOrders() {
    return await prisma.order.findMany();
  }

  async findOrderById(orderId: string) {
    return await prisma.order.findUniqueOrThrow({
      where: {
         orderId,
      },
    });
  }
  async findOrderRestaurantById(orderId: string , userRestaurantId:string ) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        orderId,
        restaurantId:userRestaurantId
      },
    });
  }
   
  async updateOrderStatus(orderId: string,restaurantId:string, newStatusId: string, userId:string , updatedAt:Date) {

    return await prisma.order.updateMany({
      where: { orderId, restaurantId },
      data: { 
        orderStatusId: newStatusId , 
        // updatedBy : userId,
        updatedAt 
      },
    });
  }

  createOrder(createOrderDto: CreateOrderDto) {
    const { customerId, restaurantId, cartItems, status } = createOrderDto;
    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order and its items in a single transaction
    const newOrder = await prisma.order.create({
      data: {
        customerId,
        restaurantId,
        totalAmount,
        orderStatus: status,
        // createdById/updatedById are required by the schema — set to the customer for now
        createdById: customerId,
        updatedById: customerId,
        orderItems: {
          create: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true, // Include items in the returned order object
      },
    });

    return newOrder;
  }
}
export const orderRepository = new OrderRepository();
