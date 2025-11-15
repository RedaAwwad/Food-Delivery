import { Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { CustomError } from "../utils/errors/custom-error";
import { CustomerOrdersDTO } from "../dto/customer-orders.dto";

class CustomerController {
  async getCustomerOrders(req: Request, res: Response) {
    const customerId = req.params.customer_id;

    if (!customerId) {
      return new CustomError({
        message: "Customer ID is required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    const orders = await customerService.getCustomerOrdersById(customerId);
    res.status(StatusCodes.OK).json(
      new SuccessResponse({
        data: orders.map((order) => new CustomerOrdersDTO(order)),
      })
    );
  }

  async getCustomerOrderDetails(req: Request, res: Response) {
    const customerId = req.params.customer_id;
    const orderId = req.params.order_id;

    if (!customerId || !orderId) {
      return new CustomError({
        message: "Customer ID and Order ID are required",
        statusCode: StatusCodes.BAD_REQUEST,
      });
    }

    // Implementation for fetching specific order details can be added here
  }
}

export const customerController = new CustomerController();
