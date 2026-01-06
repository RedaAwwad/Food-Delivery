import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { CustomError } from "../utils/errors";

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
    const order = await orderService.getOrderById(req.params.id!);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: order }));
  }

  
  async updateOrderStatusByRestaurant(req: Request, res: Response) {
    const orderId = req.params.orderId!;
    const managerId = req.user?.userId!
    const orderStatusKey = req.body.orderStatusKey;

    const order = await orderService.updateOrderStatusByRestaurant(orderId,managerId, orderStatusKey);
    res.status(StatusCodes.OK).json(new SuccessResponse({data:order}));
  }

  async cancelOrder(req: Request, res: Response) {
    const orderId = req.params.id!;
    const orderStatusKey = 'CANCELLED';
    const managerId = req.user?.userId!

    const order = await orderService.updateOrderStatusByRestaurant(orderId, managerId , orderStatusKey);
    res.status(StatusCodes.OK).json(new SuccessResponse({data:order}));
  }

  async placeOrder(req: Request, res: Response) {
    const customerId = '1';
    const restaurantId  = req.body.restaurantId;

    const order = await orderService.placeOrder(customerId, restaurantId);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse({ message: "Order placed", data: order }));
  }
}

export const orderController = new OrderController();
