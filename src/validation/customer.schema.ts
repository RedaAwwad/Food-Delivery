import Joi from "joi";
import { CreateCustomerRatingDto } from "../dto/customer.dto";
import { RatingScore } from "../generated/prisma/client";

export const createCustomerRatingSchema = Joi.object<CreateCustomerRatingDto>({
  restaurantId: Joi.string().uuid().required(),
  ratingScore: Joi.string()
    .valid(...Object.values(RatingScore))
    .required(),
  review: Joi.string().optional(),
});
