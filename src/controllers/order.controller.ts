import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";

class OrderController {
  async findAllOrdersByCustomerId(req: Request, res: Response) {
    const orders = await orderService.findAllCustomerOrdersByCustomerId(req.user?.customerId!);
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
    const order = await orderService.cancelOrder(req.body, req.user?.customerId!);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }

  async placeOrder(req: Request, res: Response) {
    const result = await orderService.placeOrder(
      req.user?.customerId!,
      req.body.restaurantId!,
      req.user?.userEmail!,       // passed to Stripe metadata
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
