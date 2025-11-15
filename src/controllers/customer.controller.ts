import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { StatusCodes } from "http-status-codes";
import { SuccessResponse } from "../utils/response/success-response";
import { customerService } from "../services/customer.service";

class CustomerController {
  async getCustomersByAdmin(req: Request, res: Response) {
    // const orders = await orderService.getAllOrders();
    // res.status(StatusCodes.OK).json(
    //   new SuccessResponse({
    //     data: orders,
    //   })
    // );
  }

  async getCustomerDetailsById(req: Request, res: Response) {
    // const order = await orderService.getOrderById(Number(req.params.id));
    // res.status(StatusCodes.OK).json(new SuccessResponse({ data: order }));
  }
  async deactivateAccount(req: Request, res: Response) {
     const customerId = Number(req.params.id)
     const result = await customerService.deactivateAccount(customerId);
        res.status(200).json({
           message: 'Customer account deactivated successfully',
           customer: result,
    }); 
  }
}

export const customerController = new CustomerController();
