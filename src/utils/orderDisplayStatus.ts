import { OrderStatusKey } from "../generated/prisma/enums";

export type KitchenDisplayStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "canceled";

type OrderWithTracking = {
  orderStatus: OrderStatusKey;
  orderTracking?: { trackingStatus: unknown }[];
};

/** Maps DB order + tracking JSON to dashboard kitchen status. */
export function deriveKitchenDisplayStatus(order: OrderWithTracking): KitchenDisplayStatus {
  if (order.orderStatus === OrderStatusKey.COMPLETED) return "completed";
  if (order.orderStatus === OrderStatusKey.CANCELED) return "canceled";

  const steps = order.orderTracking?.[0]?.trackingStatus;
  if (Array.isArray(steps) && steps.length) {
    const last = steps[steps.length - 1] as { orderStatusKey?: string };
    const key = String(last?.orderStatusKey || "").toUpperCase();
    if (key === "PENDING") return "pending";
    if (key === "ACCEPTED") return "preparing";
    if (key === "PREPARING") return "ready";
    if (key === "PICKED_UP") return "delivering";
    if (key === "DELIVERED") return "completed";
  }

  return "pending";
}

export function countByDisplayStatus<T extends OrderWithTracking>(
  orders: T[]
): Record<KitchenDisplayStatus, number> {
  const counts: Record<KitchenDisplayStatus, number> = {
    pending: 0,
    preparing: 0,
    ready: 0,
    delivering: 0,
    completed: 0,
    canceled: 0,
  };
  for (const o of orders) {
    counts[deriveKitchenDisplayStatus(o)] += 1;
  }
  return counts;
}
