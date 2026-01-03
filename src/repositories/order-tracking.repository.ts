import { prisma } from "../config/prisma.config";
import { OrderTrackingStatusDto, TrackingStatusStep } from "../dto/customer.dto";
import { Prisma } from "../generated/prisma";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { date } from 'joi';


class OrderTrackingRepository {
  async getOrderTrackingStatus(orderId:string,customerId:string):Promise<OrderTrackingStatusDto | null> {
      const data = await prisma.orderTracking.findUnique({
          where:{orderId_customerId :{orderId,customerId }
        }});

    if (!data) return null;

    return {
      orderId: data.orderId,
      customerId: data.customerId,
      trackingStatus: Array.isArray(data.trackingStatus) ? data.trackingStatus as TrackingStatusStep[] : [],
    };
  }
  
}
export const orderTrackingRepository = new OrderTrackingRepository();
