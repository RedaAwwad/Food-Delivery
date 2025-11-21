import { Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { CustomError } from "../utils/errors/custom-error";
import { CustomerOrdersDTO } from "../dto/customer-orders.dto";

class CustomerController {
  async getCustomerOrders(req: Request, res: Response) {
    const customerId = 1; // fetch from user auth token

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
    const customerId = 1; // fetch from user auth token
    const orderId = req.params.order_id ? Number(req.params.order_id) : null;

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
    const customerId = Number(req.params.id);
    const result = await customerService.deactivateAccount(customerId);
    res.status(200).json({
      message: "Customer account deactivated successfully",
      customer: result,
    });
  }
}

export const customerController = new CustomerController();
