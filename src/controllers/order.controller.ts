import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { customerService } from "../services/customer.service";
import { UnauthorizedError } from "../utils/errors";

const resolveCustomer = async (req: Request) => {
  const userId = req.user?.userId;
  const userEmail = req.user?.userEmail;

  if (!userId || !userEmail) {
    throw UnauthorizedError("Unauthorized to perform this action!");
  }

  const customer = await customerService.getCustomerByUserId(userId);
  if (!customer) {
    throw UnauthorizedError("Customer account not found for this session. Please login again.");
  }

  return {
    customerId: customer.customerId,
    userEmail,
  };
};

class OrderController {
  async findAllOrdersByCustomerId(req: Request, res: Response) {
    const { customerId } = await resolveCustomer(req);
    const orders = await orderService.findAllCustomerOrdersByCustomerId(customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: orders }));
  }

  async findOrderById(req: Request, res: Response) {
    const order = await orderService.findOrderById(req.params.id!);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: order }));
  }

  async updateOrderStatus(req: Request, res: Response) {
    const order = await orderService.updateOrderStatus(req.body);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }

  async cancelOrder(req: Request, res: Response) {
    const { customerId } = await resolveCustomer(req);
    const order = await orderService.cancelOrder(req.body, customerId);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }

  async placeOrder(req: Request, res: Response) {
    const { customerId, userEmail } = await resolveCustomer(req);
    const result = await orderService.placeOrder(
      customerId,
      userEmail,
      req.body.paymentProvider,
      req.body.paymentMethodId
    );
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse({
        message: "Order placed successfully. Complete payment using the clientSecret.",
        data: result,  // { order, clientSecret }
      }));
  }
}

export const orderController = new OrderController();
