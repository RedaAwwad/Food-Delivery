import { RatingScore } from "../generated/prisma";

export type CreateCustomerRatingDto = {
    restaurantId:string;
    ratingScore: RatingScore
    review?:string
}





