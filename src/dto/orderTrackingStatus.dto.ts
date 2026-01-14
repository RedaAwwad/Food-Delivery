export type TrackingStatusStep =  {
  orderStatusKey: "PENDING" | "ACCEPTED" | "PREPARING" | "PICKED_UP" | "DELIVERED";
  updatedAt: Date;
  updatedBy?:string
}

export type OrderTrackingStatusDto = {
  orderId: string;
  customerId: string;
  trackingStatus:TrackingStatusStep ;
}

export type UpdateOrderTrackingStatusDto = {
    orderId:string
    managerId:string
    customerId:string
    orderStatusKey:string
}