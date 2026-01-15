import { NextFunction, Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { StatusCodes } from "http-status-codes";
import { CreateAddressDTO } from "../dto/address.dto";
import { SuccessResponse } from "../utils/response/success-response";

class CustomerController {
  // async getCustomerOrdersByCustomerId(req: Request, res: Response) {
  //   const customerId = req.user!.customerId!

  //   const orders = await customerService.findCustomerOrdersByCustomerId(customerId);
  //   return res.status(StatusCodes.OK).json(
  //     new SuccessResponse({
  //       data: orders.map((order) => new CustomerOrdersDTO(order)),
  //     })
  //   );
  // }

  async getCustomerOrdersByCustomerId(req: Request, res: Response) {
    const customerId = req.user!.customerId!

    const orders = await customerService.findCustomerOrdersByCustomerId(customerId);
    return res.status(StatusCodes.OK).json(new SuccessResponse({ message: "Orders fetched successfully", data: orders }));
  }

  async findCustomerOrderByCustomerId(req: Request, res: Response) {
    const customerId = req.user!.customerId!
    const orderId = String(req.params.order_id);

    const order = await customerService.findCustomerOrderByCustomerId(customerId, orderId);

    return res.status(StatusCodes.OK).json(new SuccessResponse({ message: "Order fetched successfully", data: order }));
  }

  async deactivateAccount(req: Request, res: Response) {
    const customerId = req.user!.customerId!;
    const result = await customerService.deactivateAccount(customerId);
    res.status(200).json(new SuccessResponse({ message: "Customer account deactivated successfully", data: result }));
  }

  async createRatingByCustomer(req: Request, res: Response, next: NextFunction) {
    const customerId = req.user!.customerId!
    const ratingCustomer = await customerService.createRatingByCustomer(customerId, req.body)
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ message: "Rating created successfully", data: ratingCustomer }));
  }
}

export const customerController = new CustomerController();
