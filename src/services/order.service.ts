import { StatusCodes } from "http-status-codes"
import { CustomError } from "../utils/errors/custom-error"
import { orderRepository } from "../repositories/order.repository"

class OrderService {
   async updateStatus(orderId:number , statusId:number) {
      const order = await orderRepository.findOrderById(orderId)
      if (!order) {
         throw new CustomError({
            message:'The order not found' ,
            statusCode:StatusCodes.NOT_FOUND
        })
      }
      const updateOrder = await orderRepository.updateStatus(orderId , statusId)
      return updateOrder
   }
}
export const orderService = new OrderService()