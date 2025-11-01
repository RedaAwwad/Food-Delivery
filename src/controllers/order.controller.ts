import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";

class OrderController {
  async getAllOrders(req: Request, res: Response) {
    const orders = await orderService.getAllOrders();
    res.status(StatusCodes.OK).json(
      new SuccessResponse({
        data: orders,
      })
    );
  }

  async getOrderDetails(req: Request, res: Response) {
    const order = await orderService.getOrderById(Number(req.params.id));
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: order }));
  }

  async updateStatus(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    const orderStatus = Number(req.body.statusId);
    const order = await orderService.updateStatus(orderId, orderStatus);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }
  async cancelOrder(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    const orderStatus = Number(req.body.statusId);
    const order = await orderService.updateStatus(orderId, orderStatus);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }
}

export const orderController = new OrderController();
