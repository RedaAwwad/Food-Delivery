import { prisma } from "../config/prisma.config";
import { CreateCustomerRatingDto } from "../dto/customer.dto";

class RatingRepository {
    async createRatingByCustomer(customerId:string , createCustomerRatingDto:CreateCustomerRatingDto) {
       return await prisma.rating.create({
        data:{
            customerId , 
            restaurantId:createCustomerRatingDto.restaurantId,
            ratingScore:createCustomerRatingDto.ratingScore , 
            review:createCustomerRatingDto.review ?? null 
         }
       })
 }
}
export const ratingRepository = new RatingRepository();