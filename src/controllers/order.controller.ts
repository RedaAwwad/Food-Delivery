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
    const order = await orderService.getOrderById(req.params.id!);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: order }));
  }

  async updateStatus(req: Request, res: Response) {
    const orderId = req.params.id!;
    const newOrderStatus = req.body.status;
       
    const order = await orderService.updateOrderStatus(orderId, newOrderStatus);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }

  async cancelOrder(req: Request, res: Response) {
    const orderId = req.params.id!;
    const orderStatus = req.body.status;
    
    const order = await orderService.updateOrderStatus(orderId, orderStatus);    
    res.status(StatusCodes.OK).json({ success: true, data: order });
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
