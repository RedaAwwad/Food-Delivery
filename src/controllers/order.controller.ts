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
    const newOrderStatus = Number(req.body.statusId);
       
    const userId   = 1       // req.user.id
    const userRole = 'admin' // req.user.role 
    
    // const user = req.user  // TODO Send in arq instead multi args
    const order = await orderService.updateOrderStatus(orderId, newOrderStatus, userId , userRole);
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }
  async cancelOrder(req: Request, res: Response) {
    const orderId = Number(req.params.id);
    const orderStatus = Number(req.body.statusId);
    
    const userId   = 1       // req.user.id
    const userRole = 'admin' // req.user.role 
    // const user = req.user  // TODO Send in arq instead multi args
    const order = await orderService.updateOrderStatus(orderId, orderStatus, userId, userRole);    
    res.status(StatusCodes.OK).json({ success: true, data: order });
  }

  async placeOrder(req: Request, res: Response) {
    const customerId = 1;
    const restaurantId  = req.body.restaurantId;

    const order = await orderService.placeOrder(customerId, restaurantId);
    res
      .status(StatusCodes.CREATED)
      .json(new SuccessResponse({ message: "Order placed", data: order }));
  }
}

export const orderController = new OrderController();
