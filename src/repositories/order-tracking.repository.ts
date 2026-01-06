import { prisma } from '../config/prisma.config';
import { OrderTrackingStatusDto, TrackingStatusStep } from "../dto/orderTrackingStatus.dto";
import { Prisma } from "../generated/prisma";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { date } from 'joi';
import { OrderTracking } from '../generated/prisma/index';
import { JsonArray } from "@prisma/client/runtime/library";


class OrderTrackingRepository {
  async getOrderTrackingStatus(orderId: string, customerId: string) {
  const tracking = await prisma.orderTracking.findUnique({
    where: { orderId_customerId: { orderId, customerId } },
    select: { orderId: true, customerId: true, trackingStatus: true }
  });

  if (!tracking) {
    throw new CustomError({
      message: "Order tracking not found",
      statusCode: StatusCodes.NOT_FOUND
    });
  }
  return tracking
}

 async updateOrderTrackingStatus(prisma:Prisma.TransactionClient , orderId:string , customerId:string, trackingStatus:TrackingStatusStep[]) {
   return await prisma.orderTracking.update({
    where: {
      orderId_customerId: {
        orderId,
        customerId
      },
    },
    data: {
      trackingStatus,
    },
  });
  
 }
}
export const orderTrackingRepository = new OrderTrackingRepository();
