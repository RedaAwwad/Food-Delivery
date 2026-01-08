import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";

class OrderController {
  async findAllOrdersByCustomerId(req: Request, res: Response) {
    const orders = await orderService.findAllOrdersByCustomerId(req.user?.customerId!);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: orders}));
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
    const order = await orderService.cancelOrder(req.body);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }

  async placeOrder(req: Request, res: Response) {
    const order = await orderService.placeOrder(req.user?.customerId!, req.body.restaurantId!);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse({ message: "Order placed", data: order }));
  }
}

export const orderController = new OrderController();
