import { Request, Response, NextFunction } from "express";
import { ratingService } from "../services/rating.service";
import { BadRequestError } from "../utils/errors";

class RatingController {
  async findRatingsByRestaurantId(req: Request, res: Response, next: NextFunction) {
    const { restaurantId } = req.body;

    const ratings = await ratingService.findRatingsByRestaurantId(restaurantId);
    if (!ratings) throw BadRequestError("Failed to find ratings");

    res.status(200).json({ success: true, data: ratings });
  }

  async findRatingsByCustomerId(req: Request, res: Response, next: NextFunction) {
    const customerId = req.user!.customerId!;

    const ratings = await ratingService.findRatingsByCustomerId(customerId);
    if (!ratings) throw BadRequestError("Failed to find ratings");

    res.status(200).json({ success: true, data: ratings });
  }

  async findRatingByRestaurantIdAndCustomerId(req: Request, res: Response, next: NextFunction) {
    const customerId = req.user!.customerId!;
    const { restaurantId } = req.body;

    const rating = await ratingService.findRatingByRestaurantIdAndCustomerId(
      restaurantId,
      customerId
    );
    if (!rating) throw BadRequestError("Failed to find rating");

    res.status(200).json({ success: true, data: rating });
  }

  async findTopRatedRestaurants(req: Request, res: Response, next: NextFunction) {
    const ratings = await ratingService.findTopRatedRestaurants();
    if (!ratings) throw BadRequestError("Failed to find top rated restaurants");

    res.status(200).json({ success: true, data: ratings });
  }

  async createRatingByCustomer(req: Request, res: Response, next: NextFunction) {
    const customerId = req.user!.customerId!;
    const { restaurantId, ratingScore, review } = req.body;

    const rating = await ratingService.createRatingByCustomer({
      customerId,
      restaurantId,
      ratingScore,
      review,
    });
    if (!rating) throw BadRequestError("Failed to create rating");

    res.status(201).json({ success: true, data: rating });
  }

  async updateRatingByRestaurantIdAndCustomerId(req: Request, res: Response, next: NextFunction) {
    const customerId = req.user!.customerId!;
    const { ratingId, restaurantId, ratingScore, review } = req.body;

    const rating = await ratingService.updateRatingByRestaurantIdAndCustomerId({
      ratingId,
      customerId,
      restaurantId,
      ratingScore,
      review,
    });
    if (!rating) throw BadRequestError("Failed to update rating");

    res.status(200).json({ success: true, data: rating });
  }

  async deleteRatingByRestaurantIdAndCustomerId(req: Request, res: Response, next: NextFunction) {
    const { ratingId } = req.body;

    const rating = await ratingService.deleteRatingByRestaurantIdAndCustomerId(ratingId);
    if (!rating) throw BadRequestError("Failed to delete rating");

    res.status(200).json({ success: true, data: rating });
  }
}
export const ratingController = new RatingController();
