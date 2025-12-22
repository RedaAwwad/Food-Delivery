import { prisma } from "../config/prisma.config";
import { Prisma } from "../generated/prisma";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";


class OrderTrackingRepository {
  async getOrderTrackingHistory( orderId:string) {
        return await prisma.orderTracking.findMany({
          where:{orderId}
        })
  }

}
export const orderTrackingRepository = new OrderTrackingRepository();
