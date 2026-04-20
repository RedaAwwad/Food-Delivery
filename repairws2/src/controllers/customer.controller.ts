import { NextFunction, Request, Response } from "express";
import { customerService } from "../services/customer.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";

class CustomerController {
  async getCustomerOrdersByCustomerId(req: Request, res: Response) {
    const customerId = req.user!.customerId!;

    const orders = await customerService.findCustomerOrdersByCustomerId(customerId);
    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Orders fetched successfully", data: orders }));
  }

  async findCustomerOrderByCustomerId(req: Request, res: Response) {
    const customerId = req.user!.customerId!;
    const orderId = String(req.params.order_id);

    const order = await customerService.findCustomerOrderByCustomerId(customerId, orderId);

    return res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Order fetched successfully", data: order }));
  }

  async deactivateAccount(req: Request, res: Response) {
    const customerId = req.user!.customerId!;
    const result = await customerService.deactivateAccount(customerId);
    res
      .status(200)
      .json(
        new SuccessResponse({ message: "Customer account deactivated successfully", data: result })
      );
  }

  async createRatingByCustomer(req: Request, res: Response, next: NextFunction) {
    const customerId = req.user!.customerId!;
    const ratingCustomer = await customerService.createRatingByCustomer(customerId, req.body);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse({ message: "Rating created successfully", data: ratingCustomer }));
  }

  // Address Management
  async createAddress(req: Request, res: Response) {
    const customerId = req.user!.customerId!;
    const address = await customerService.addAddress(customerId, req.body);
    res.status(StatusCodes.CREATED).json(new SuccessResponse({ data: address }));
  }

  async getMyAddresses(req: Request, res: Response) {
    const customerId = req.user!.customerId!;
    const addresses = await customerService.getAddresses(customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: addresses }));
  }

  async updateAddress(req: Request, res: Response) {
    const { addressId } = req.params;
    const customerId = req.user!.customerId!;
    const address = await customerService.updateAddress(customerId, addressId as string, req.body);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: address }));
  }

  async deleteAddress(req: Request, res: Response) {
    const { addressId } = req.params;
    const customerId = req.user!.customerId!;
    await customerService.deleteAddress(customerId, addressId as string);
    res
      .status(StatusCodes.OK)
      .json(new SuccessResponse({ message: "Address deleted successfully" }));
  }
}

export const customerController = new CustomerController();
