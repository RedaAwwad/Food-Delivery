import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";


class OrderController {
  async getAllOrders(req: Request, res: Response) {}
    async updateStatus(req:Request , res:Response) {
      const orderId = Number(req.params.id)
      const orderStatus = Number(req.body.statusId)
      const order = await orderService.updateStatus(orderId , orderStatus)
      res.status(200).json({ success: true, data: order });
    }
}

export const orderController = new OrderController();
