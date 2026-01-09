import Joi from "joi";

export const createCustomerRatingSchema = Joi.object({
  restaurantId: Joi.string().uuid().required(),
  ratingScore: Joi.string().valid(["ONE", "TWO", "THREE", "FOUR", "FIVE"]).required(),
  review: Joi.string().optional(),
}).required();
