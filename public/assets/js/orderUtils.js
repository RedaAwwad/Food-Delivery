/** Normalize API orders for dashboard / orders / reports pages. */

export const ORDER_STATUSES = [
  { key: "pending", label: "Pending", icon: "clock", tint: "tint-amber", color: "#f59e0b" },
  { key: "preparing", label: "Preparing", icon: "chef", tint: "tint-blue", color: "#2563eb" },
  { key: "ready", label: "Ready", icon: "check", tint: "tint-violet", color: "#6d5efc" },
  { key: "delivering", label: "Delivering", icon: "truck", tint: "tint-brand", color: "#ff5a1f" },
  { key: "completed", label: "Completed", icon: "checkCircle", tint: "tint-green", color: "#16a34a" },
  { key: "canceled", label: "Canceled", icon: "x", tint: "tint-amber", color: "#ef4444" },
];

const TRACK_TO_UI = {
  PENDING: "pending",
  ACCEPTED: "preparing",
  PREPARING: "ready",
  PICKED_UP: "delivering",
  DELIVERED: "completed",
};

export function deriveDisplayStatus(o) {
  const db = String(o.orderStatus || "").toUpperCase();
  if (db === "COMPLETED") return "completed";
  if (db === "CANCELED") return "canceled";

  const steps = o.orderTracking?.[0]?.trackingStatus;
  if (Array.isArray(steps) && steps.length) {
    const last = steps[steps.length - 1];
    const key = String(last?.orderStatusKey || last?.orderStatus || "").toUpperCase();
    return TRACK_TO_UI[key] || "pending";
  }
  return "pending";
}

export function normalizeOrder(o) {
  if (o.orderId) {
    const created = new Date(o.createdAt);
    return {
      orderId: o.orderId,
      id: o.orderId.slice(0, 8).toUpperCase(),
      customer: o.customer?.user?.userName || "Customer",
      avatar: o.customer?.customerAvatar || "",
      branch: o.restaurant?.restaurantName || "—",
      items: (o.orderItems || []).map((it) => ({
        name: it.menuItem?.menuItemName || "Item",
        qty: it.quantity,
        price: it.price,
      })),
      total: o.totalAmount,
      status: deriveDisplayStatus(o),
      channel: "Delivery",
      payment: "Card",
      time: created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: created.toLocaleDateString(),
      mins: Math.max(1, Math.round((Date.now() - created.getTime()) / 60000)),
    };
  }
  return o;
}

export function statusCounts(orders) {
  const c = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, 0]));
  for (const o of orders) {
    const s = o.status || deriveDisplayStatus(o);
    if (c[s] !== undefined) c[s]++;
  }
  return c;
}

/** Doughnut chart segments from API orderStatusReport. */
export function chartSegmentsFromReport(report) {
  const total = report?.total || 0;
  if (!total) return [];
  return ORDER_STATUSES
    .map((s) => ({
      label: s.label,
      value: Math.round(((report[s.key] ?? 0) / total) * 100),
      color: s.color,
      count: report[s.key] ?? 0,
    }))
    .filter((s) => s.count > 0);
}

/** Active orders badge: everything except completed & canceled. */
export function activeOrderCount(report) {
  if (!report) return 0;
  return ORDER_STATUSES
    .filter((s) => s.key !== "completed" && s.key !== "canceled")
    .reduce((n, s) => n + (report[s.key] ?? 0), 0);
}
