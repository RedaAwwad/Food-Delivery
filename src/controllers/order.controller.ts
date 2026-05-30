import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { orderTrackingService } from "../services/orderTracking.service";
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
  async findAllOrdersForAdmin(req: Request, res: Response) {
    const orders = await orderService.findAllOrdersForAdmin();
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: orders }));
  }

  async getAdminDashboardStats(req: Request, res: Response) {
    const stats = await orderService.getAdminDashboardStats();
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: stats }));
  }

  async findAllOrdersByCustomerId(req: Request, res: Response) {
    const { customerId } = await resolveCustomer(req);
    const orders = await orderService.findAllCustomerOrdersByCustomerId(customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: orders }));
  }

  async findOrderById(req: Request, res: Response) {
    const { customerId } = await resolveCustomer(req);
    const orderId = req.params.orderId!;
    const order = await orderService.findOrderByOrderIdAndCustomerId(orderId, customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: order }));
  }

  async getOrderTracking(req: Request, res: Response) {
    const { customerId } = await resolveCustomer(req);
    const orderId = req.params.orderId!;
    const tracking = await orderTrackingService.getOrderTrackingStatus(orderId, customerId);
    res.status(StatusCodes.OK).json(new SuccessResponse({ data: tracking }));
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

  /** After Stripe.js confirms payment in the browser, finalize order in DB (webhook backup). */
  async confirmPayment(req: Request, res: Response) {
    const { customerId } = await resolveCustomer(req);
    const orderId = req.body?.orderId as string;
    if (!orderId) {
      res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "orderId is required" });
      return;
    }
    const result = await orderService.confirmStripePayment(customerId, orderId);
    res.status(StatusCodes.OK).json(new SuccessResponse({
      message: result.alreadyCompleted ? "Order already confirmed" : "Payment confirmed",
      data: result,
    }));
  }
}

export const orderController = new OrderController();
