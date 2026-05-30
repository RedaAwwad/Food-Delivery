import { prisma } from "../config/prisma.config";
import { CreateOrderDto, UpdateOrderStatusDto } from "../dto/order.dto";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { PrismaTx } from "../types/prisma.types";
import { PrismaClient } from "../generated/prisma/client";
import { OrderStatusKey } from "../generated/prisma/enums";
import { countByDisplayStatus, deriveKitchenDisplayStatus } from "../utils/orderDisplayStatus";

const adminOrderInclude = {
  customer: {
    include: {
      user: { select: { userName: true, userEmail: true } },
    },
  },
  restaurant: { select: { restaurantId: true, restaurantName: true } },
  orderItems: {
    include: {
      menuItem: {
        select: { menuItemId: true, menuItemName: true, menuItemImageUrl: true, price: true },
      },
    },
  },
  orderTracking: { select: { trackingStatus: true } },
} as const;

class OrderRepository {
  async findAllCustomerOrdersByCustomerId(customerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId
      },
      include: {
        restaurant: { select: { restaurantName: true } },
        orderItems: {
          include: {
            menuItem: { select: { menuItemName: true, menuItemImageUrl: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!orders)
      throw NotFoundError("No Orders Found For This Customer")

    return orders
  }

  async findOrderByOrderIdAndCustomerId(orderId: string, customerId: string) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        orderId,
        customerId
      },
      include: {
        orderItems: true,
      }
    });
  }

  async findOrderById(orderId: string) {
    return await prisma.order.findUniqueOrThrow({
      where: {
        orderId
      },
      include: {
        orderItems: true,
      }
    });
  }

  async updateOrderStatus(data: UpdateOrderStatusDto, tx: PrismaTx | PrismaClient = prisma) {
    const updatedStatus = await tx.order.update({
      where: { orderId: data.orderId },
      data: { orderStatus: data.newOrderStatus },
    });

    if (!updatedStatus) throw BadRequestError("Failed To Update Order")

    return updatedStatus
  }

  async cancelOrder(orderId: string) {
    try {
      return await prisma.order.update({
        where: { orderId },
        data: { orderStatus: "CANCELED" },
      });

    } catch (error: any) {
      throw BadRequestError("Failed To Cancel Order", error)
    }
  }

  async createOrder(createOrderDto: CreateOrderDto, tx: PrismaTx | PrismaClient = prisma) {
    const { customerId, restaurantId, cartItems, orderStatus } = createOrderDto;
    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create the order and its items in a single transaction
    const newOrder = await tx.order.create({
      data: {
        customerId,
        restaurantId,
        totalAmount,
        orderStatus,
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

    if (!newOrder) throw BadRequestError("Failed To Create Order")

    return newOrder;
  }

  async findStaleOrders({ status, createdBefore }: { status: OrderStatusKey; createdBefore: Date }) {
    return await prisma.order.findMany({
      where: {
        orderStatus: status,
        createdAt: { lt: createdBefore },
      },
      include: {
        orderItems: true,
      },
    });
  }

  async findAllOrdersForAdmin(limit = 500) {
    return prisma.order.findMany({
      include: adminOrderInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getAdminDashboardStats() {
    const [orders, customerCount, restaurantCount, activeRestaurantCount, topItems] =
      await Promise.all([
        prisma.order.findMany({
          select: {
            orderId: true,
            orderStatus: true,
            totalAmount: true,
            createdAt: true,
            orderTracking: { select: { trackingStatus: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.customer.count(),
        prisma.restaurant.count(),
        prisma.restaurant.count({ where: { isAvailable: true } }),
        prisma.orderItem.groupBy({
          by: ["menuItemId"],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: "desc" } },
          take: 5,
        }),
      ]);

    const statusCounts = countByDisplayStatus(orders);
    const totalRevenue = orders
      .filter((o) => o.orderStatus === OrderStatusKey.COMPLETED)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const monthLabels: string[] = [];
    const revenueByMonth: number[] = [];
    const ordersByMonth: number[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(d.toLocaleString("en-US", { month: "short" }));
      const month = d.getMonth();
      const year = d.getFullYear();
      const inMonth = orders.filter(
        (o) => o.createdAt.getMonth() === month && o.createdAt.getFullYear() === year
      );
      ordersByMonth.push(inMonth.length);
      revenueByMonth.push(
        Math.round(
          inMonth
            .filter((o) => o.orderStatus === OrderStatusKey.COMPLETED)
            .reduce((s, o) => s + o.totalAmount, 0) / 1000
        )
      );
    }

    const menuItemIds = topItems.map((t) => t.menuItemId);
    const menuItems = menuItemIds.length
      ? await prisma.menuItem.findMany({
          where: { menuItemId: { in: menuItemIds } },
          include: { menuCategory: { select: { menuCategoryName: true } } },
        })
      : [];
    const menuById = new Map(menuItems.map((m) => [m.menuItemId, m]));

    const popularMeals = topItems.map((t) => {
      const m = menuById.get(t.menuItemId);
      return {
        name: m?.menuItemName || "Menu item",
        cat: m?.menuCategory?.menuCategoryName || "Menu",
        price: m?.price ?? 0,
        sold: t._sum.quantity ?? 0,
        img: m?.menuItemImageUrl || "",
        rating: 4.5,
      };
    });

    const activeStatuses = new Set(["pending", "preparing", "ready", "delivering"]);
    const recentActive = orders
      .filter((o) => activeStatuses.has(deriveKitchenDisplayStatus(o)))
      .slice(0, 5);

    const notifications = recentActive.map((o) => ({
      type: "order",
      title: `New activity · #${o.orderId.slice(0, 8).toUpperCase()}`,
      time: formatRelativeTime(o.createdAt),
      icon: "cart",
      tint: "tint-brand",
    }));

    return {
      stats: {
        orders: { value: orders.length, delta: 0, series: ordersByMonth },
        revenue: { value: totalRevenue, delta: 0, series: revenueByMonth },
        branches: {
          value: restaurantCount,
          active: activeRestaurantCount,
          delta: 0,
        },
        customers: { value: customerCount, delta: 0, series: [] },
      },
      orderStatusReport: {
        pending: statusCounts.pending,
        preparing: statusCounts.preparing,
        ready: statusCounts.ready,
        delivering: statusCounts.delivering,
        completed: statusCounts.completed,
        canceled: statusCounts.canceled,
        total: orders.length,
      },
      revenueChart: {
        labels: monthLabels,
        revenue: revenueByMonth,
        orders: ordersByMonth.map((n) => Math.max(1, Math.round(n / 10))),
      },
      popularMeals,
      notifications,
    };
  }
}

function formatRelativeTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}

export const orderRepository = new OrderRepository();
