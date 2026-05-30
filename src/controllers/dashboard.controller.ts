import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { orderService } from "../services/order.service";
import { menuItemRepository } from "../repositories/menuItem.repository";
import { prisma } from "../config/prisma.config";
import { OrderStatusKey } from "../generated/prisma/enums";
import { Prisma } from "../generated/prisma/client";
import { BadRequestError } from "../utils/errors";
import { orderTrackingRepository } from "../repositories/order-tracking.repository";
import { menuService } from "../services/menu.service";
import { menuCategoryService } from "../services/menuCategory.service";
import { restaurantRepository } from "../repositories/restaurant.repository";
import { restaurantService } from "../services/restaurant.service";
import { PasswordUtils } from "../utils/password.utils";
import { DEFAULT_ROLE_KEYS } from "../utils/constants";
import { v7 as uuidv7 } from "uuid";
import { formatPagination, PaginationDto } from "../utils/pagination.utils";

const KITCHEN_TO_TRACKING: Record<string, string> = {
  pending: "PENDING",
  preparing: "ACCEPTED",
  ready: "PREPARING",
  delivering: "PICKED_UP",
};

class DashboardController {
  async getMenuByRestaurant(req: Request, res: Response) {
    const restaurantId = req.params.restaurantId!;
    const data = await menuItemRepository.findAllMenuItemsByRestaurantIdForAdmin(restaurantId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data }));
  }

  async ensureMenu(req: Request, res: Response) {
    const restaurantId = req.params.restaurantId!;
    const menuDesc = (req.body?.menuDesc as string) || "Main menu";
    let menu = await prisma.menu.findUnique({ where: { restaurantId } });
    if (!menu) {
      menu = await menuService.createMenu({
        restaurantId,
        menuDesc,
        isActive: true,
      });
    }
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: menu }));
  }

  async createMenuCategory(req: Request, res: Response) {
    const restaurantId = req.params.restaurantId!;
    let menu = await prisma.menu.findUnique({ where: { restaurantId } });
    if (!menu) {
      menu = await menuService.createMenu({
        restaurantId,
        menuDesc: "Main menu",
        isActive: true,
      });
    }
    const category = await menuCategoryService.createMenuCategory({
      menuId: menu.menuId,
      menuCategoryName: req.body.menuCategoryName,
      menuCategoryImageUrl: req.body.menuCategoryImageUrl || "",
    });
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: category }));
  }

  async deleteMenuCategory(req: Request, res: Response) {
    const menuCategoryId = req.body.menuCategoryId as string;
    if (!menuCategoryId) throw BadRequestError("menuCategoryId is required");
    await menuCategoryService.deleteMenuCategory(menuCategoryId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ message: "Category deleted" }));
  }

  async listBranches(req: Request, res: Response) {
    const query = req.query as PaginationDto;
    const page = Number(query.page) || 1;
    const perPage = Number(query.perPage) || 24;
    const { restaurants, total } = await restaurantRepository.findAllRestaurantsEnriched({
      page: String(page),
      perPage: String(perPage),
    });
    res.status(StatusCodes.OK).json(
      new SuccessResponse({
        data: restaurants,
        meta: formatPagination({ page, perPage, total }),
      })
    );
  }

  async createBranch(req: Request, res: Response) {
    const restaurantName = String(req.body?.restaurantName || "").trim();
    if (!restaurantName) throw BadRequestError("restaurantName is required");

    const manager = await findOrCreateManager(restaurantName);
    const city = String(req.body?.city || "").trim();
    const addresses = city
      ? [
          {
            addressId: uuidv7(),
            street: String(req.body?.street || "Main street"),
            city,
            area: String(req.body?.area || city),
            zipCode: String(req.body?.zipCode || ""),
            latitude: 0,
            longitude: 0,
            isPrimary: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      : [];

    const baseData = {
      managerId: manager.userId,
      restaurantName,
      restaurantBio: String(req.body?.restaurantBio || "Premium dining, delivered fresh."),
      restaurantLogo:
        String(req.body?.restaurantLogo || "") ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
      isAvailable: req.body?.isAvailable !== false,
    };
    const restaurant = await prisma.restaurant.create({
      data: addresses.length ? { ...baseData, addresses } : baseData,
    });

    let menu = await prisma.menu.findUnique({ where: { restaurantId: restaurant.restaurantId } });
    if (!menu) {
      menu = await menuService.createMenu({
        restaurantId: restaurant.restaurantId,
        menuDesc: "Main menu",
        isActive: true,
      });
    }

    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: { restaurant, menu } }));
  }

  async updateBranch(req: Request, res: Response) {
    const restaurantId = String(req.body?.restaurantId || "");
    if (!restaurantId) throw BadRequestError("restaurantId is required");

    const existing = await prisma.restaurant.findUnique({ where: { restaurantId } });
    if (!existing) throw BadRequestError("Restaurant not found");

    const city = req.body?.city != null ? String(req.body.city).trim() : null;
    let addresses = existing.addresses;
    if (city) {
      const list = Array.isArray(addresses) ? [...(addresses as object[])] : [];
      if (list.length) {
        list[0] = { ...(list[0] as object), city, updatedAt: new Date().toISOString() };
      } else {
        list.push({
          addressId: uuidv7(),
          street: String(req.body?.street || "Main street"),
          city,
          area: city,
          zipCode: "",
          latitude: 0,
          longitude: 0,
          isPrimary: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      addresses = list as never;
    }

    const updated = await prisma.restaurant.update({
      where: { restaurantId },
      data: {
        ...(req.body?.restaurantName
          ? { restaurantName: String(req.body.restaurantName).trim() }
          : {}),
        ...(req.body?.restaurantBio != null
          ? { restaurantBio: String(req.body.restaurantBio) }
          : {}),
        ...(req.body?.restaurantLogo != null
          ? { restaurantLogo: String(req.body.restaurantLogo) }
          : {}),
        ...(req.body?.isAvailable != null
          ? { isAvailable: Boolean(req.body.isAvailable) }
          : {}),
        ...(city ? { addresses: addresses as Prisma.InputJsonValue } : {}),
      },
    });

    res.status(StatusCodes.OK).json(new SuccessResponse({ data: updated }));
  }

  async toggleBranch(req: Request, res: Response) {
    const restaurantId = req.params.restaurantId!;
    const updated = await restaurantService.enableOrDisableRestaurant(restaurantId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: updated }));
  }

  async deleteBranch(req: Request, res: Response) {
    const restaurantId = String(req.body?.restaurantId || req.params.restaurantId || "");
    if (!restaurantId) throw BadRequestError("restaurantId is required");
    await restaurantService.deleteRestaurant(restaurantId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ message: "Branch deleted" }));
  }

  async updateKitchenStatus(req: Request, res: Response) {
    const orderId = req.params.orderId!;
    const displayStatus = String(req.body?.displayStatus || "").toLowerCase();

    const order = await prisma.order.findUnique({
      where: { orderId },
      select: { orderId: true, customerId: true, orderStatus: true },
    });
    if (!order) throw BadRequestError("Order not found");

    if (displayStatus === "completed") {
      const updated = await orderService.updateOrderStatus({
        orderId,
        newOrderStatus: OrderStatusKey.COMPLETED,
      });
      await ensureTracking(orderId, order.customerId, "DELIVERED");
      res.status(StatusCodes.OK).json(new SuccessResponse({ data: updated }));
      return;
    }

    if (displayStatus === "canceled") {
      const updated = await orderService.updateOrderStatus({
        orderId,
        newOrderStatus: OrderStatusKey.CANCELED,
      });
      res.status(StatusCodes.OK).json(new SuccessResponse({ data: updated }));
      return;
    }

    const trackKey = KITCHEN_TO_TRACKING[displayStatus];
    if (!trackKey) throw BadRequestError("Invalid display status");

    await ensureTracking(orderId, order.customerId, trackKey);
    const fresh = await prisma.order.findUnique({
      where: { orderId },
      include: {
        orderItems: { include: { menuItem: true } },
        customer: { include: { user: { select: { userName: true } } } },
        restaurant: { select: { restaurantName: true } },
        orderTracking: { select: { trackingStatus: true } },
      },
    });
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: fresh }));
  }
}

async function ensureTracking(orderId: string, customerId: string, orderStatusKey: string) {
  const existing = await prisma.orderTracking.findUnique({
    where: { orderId_customerId: { orderId, customerId } },
  });
  if (!existing) {
    await prisma.orderTracking.create({
      data: {
        orderId,
        customerId,
        trackingStatus: [{ orderStatusKey, updatedAt: new Date() }],
      },
    });
    return;
  }
  await orderTrackingRepository.appendOrderTrackingStatus(
    orderId,
    customerId,
    orderStatusKey as "PENDING" | "ACCEPTED" | "PREPARING" | "PICKED_UP" | "DELIVERED"
  );
}

async function findOrCreateManager(restaurantName: string) {
  const candidates = await prisma.user.findMany({
    where: { restaurant: null, isActive: true },
    take: 40,
    orderBy: { createdAt: "desc" },
  });

  const freeManager = candidates.find((u) => {
    const roles = u.roles;
    return Array.isArray(roles) && roles.includes(DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER);
  });

  if (freeManager) return freeManager;

  const slug = restaurantName.replace(/\W+/g, "").slice(0, 12).toLowerCase() || "branch";
  const userEmail = `manager.${slug}.${Date.now()}@foodhub.local`;
  return prisma.user.create({
    data: {
      userName: `Manager · ${restaurantName}`,
      userEmail,
      userPassword: await PasswordUtils.hash("Pass@123"),
      roles: [DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER],
      isActive: true,
      isConfirmed: true,
    },
  });
}

export const dashboardController = new DashboardController();
