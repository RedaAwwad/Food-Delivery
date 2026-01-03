import { RatingScore } from "../generated/prisma";

export type CreateCustomerRatingDto = {
    restaurantId:string;
    ratingScore: RatingScore
    review?:string
}
// DTO
export type TrackingStatusStep =  {
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "PICKED_UP" | "DELIVERED";
  updatedAt: string;
}

export type OrderTrackingStatusDto = {
  orderId: string;
  customerId: string;
  trackingStatus: TrackingStatusStep[];
}

export type CreateOrderTrackingDto = {
  orderId: string;
  customerId: string;
  trackingStatus: Record<string, any>;
}
export type UpdateOrderTrackingDto = {
  trackingStatus: Record<string, any>; // JSON مع الحالة الجديدة
}

