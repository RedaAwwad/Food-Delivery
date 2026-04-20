import { RatingScore } from "../generated/prisma/client";

export type CreateCustomerRatingDto = {
  restaurantId: string;
  ratingScore: RatingScore;
  review?: string;
};
