import { prisma } from "../config/prisma.config";
import { TrackingStatusStep } from "../dto/orderTrackingStatus.dto";
import { NotFoundError } from "../utils/errors";

class OrderTrackingRepository {
  async getOrderTrackingStatus(orderId: string, customerId: string) {
    const tracking = await prisma.orderTracking.findUnique({
      where: { orderId_customerId: { orderId, customerId } },
      select: { orderId: true, customerId: true, trackingStatus: true }
    });

    if (!tracking) throw NotFoundError("Order tracking not found");

    return tracking
  }

  async appendOrderTrackingStatus(orderId: string, customerId: string, orderStatusKey: TrackingStatusStep["orderStatusKey"], updatedBy?: string) {
    return await prisma.orderTracking.status().append(orderId, customerId, { 
      orderStatusKey, 
      ...(updatedBy !== undefined ? { updatedBy } : {}) 
    });
  }
}

export const orderTrackingRepository = new OrderTrackingRepository();