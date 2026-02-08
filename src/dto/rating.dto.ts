import { RatingScore } from "../generated/prisma/client";

export type CreateCustomerRatingDto = {
    customerId: string;
    restaurantId: string;
    ratingScore: RatingScore
    review?: string
}
export interface updateCustomerRatingDto {
    ratingId: string
    customerId: string;
    restaurantId: string;
    ratingScore: RatingScore
    review?: string
}
