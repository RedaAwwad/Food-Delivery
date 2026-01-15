import Joi from "joi";
import { CreateCustomerRatingDto } from "../dto/rating.dto";

export const createCustomerRatingSchema = Joi.object<CreateCustomerRatingDto>({
       restaurantId: Joi.string().uuid().required(),
       ratingScore: Joi.string()
              .valid(...Object.values(RatingScore))
              .required(),
       review: Joi.string().optional(),
})
