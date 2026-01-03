import { NextFunction, Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { CustomError } from "../utils/errors/custom-error";
import { CustomerOrdersDTO } from "../dto/customer-orders.dto";
import { CreateCustomerRatingDto } from "../dto/customer.dto";
import { date } from "joi";
import { orderTrackingService } from "../services/orderTracking.service";
import { Customer } from '../generated/prisma/index';

class CustomerController {
  async getCustomerOrders(req: Request, res: Response) {
  const customerId = req.user.userId 

    if (!customerId) {
      return new CustomError({
        message: "Customer Id is required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const orders = await customerService.getCustomerOrdersByCustomerId(customerId);
    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        data: orders.map((order) => new CustomerOrdersDTO(order)),
      })
    );
  }

  async getCustomerOrderDetails(req: Request, res: Response) {
  const customerId = req.user.userId 
  const orderId = req.params.order_id ? String(req.params.order_id) : null;

    if (!customerId || !orderId) {
      return new CustomError({
        message: "Customer Id and Order Id are required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    } 

    const order = await customerService.findCustomerOrderByCustomerId(customerId, orderId);

    return res.status(StatusCodes.OK).json(
      new SuccessResponse({
        data: new CustomerOrdersDTO(order),
      })
    );
  }
  async deactivateAccount(req: Request, res: Response) {
  const customerId = req.user.userId;
  const result = await customerService.deactivateAccount(customerId);
    res.status(200).json({
      message: "Customer account deactivated successfully",
      customer: result,
    });
  }
  async createRatingByCustomer(req:Request<{} ,{},CreateCustomerRatingDto> , res:Response, next:NextFunction) {
      const customerId = req.user?.userId

      const ratingCustomer = await 
      customerService.createRatingByCustomer(customerId! , req.body)
      res.status(StatusCodes.CREATED).json({
        success:true , 
        date:ratingCustomer
      })
  }
  async getOrderTrackingStatus(req:Request , res:Response) {
      const orderId = req.params.orderId!;
      const customerId = req.user?.userId
      const orderTracking = await orderTrackingService.getOrderTrackingStatus(orderId, customerId)
      return res.status(StatusCodes.OK).json(new SuccessResponse({data:orderTracking}))
    }
}

export const customerController = new CustomerController();
