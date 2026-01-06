import { prisma } from '../config/prisma.config';
import { CreateOrderDto } from "../dto/createOrderDto";
import { UpdateOrderStatusDto } from '../dto/updateOrderStatus.dto';
import { Prisma } from '../generated/prisma';
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
      },prisma
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
   
  async updateOrderStatusByRestaurant(prisma:Prisma.TransactionClient, updateOrderStatusDto:UpdateOrderStatusDto) {

    return await prisma.order.update({
      where: {orderId:updateOrderStatusDto.orderId},
      data: { 
        orderStatusDetails : {
          connect:{orderStatusKey:updateOrderStatusDto.orderStatusKey}
        } 
        ,
        updatedBy :{ 
          connect: {userId:updateOrderStatusDto.managerId}
        } 
      },
    });
  }

  async createOrder(createOrderDto: CreateOrderDto) {
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
