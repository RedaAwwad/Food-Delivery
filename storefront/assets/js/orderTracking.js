/** Map API / local order data to the storefront tracking UI. */

const TRACKING_KEY_TO_STEP = {
  PENDING: 0,
  ACCEPTED: 0,
  PREPARING: 1,
  PICKED_UP: 3,
  DELIVERED: 4,
};

const ORDER_STATUS_TO_STEP = {
  PENDING: 1,
  COMPLETED: 4,
  CANCELED: -1,
};

export function stepFromTracking(trackingStatus) {
  if (!Array.isArray(trackingStatus) || !trackingStatus.length) return null;
  const last = trackingStatus[trackingStatus.length - 1];
  const key = last?.orderStatusKey || last?.orderStatus;
  return TRACKING_KEY_TO_STEP[key] ?? null;
}

export function stepFromOrderStatus(orderStatus) {
  const key = String(orderStatus || "").toUpperCase();
  return ORDER_STATUS_TO_STEP[key] ?? 0;
}

export function isTrackableStatus(status) {
  const s = String(status || "").toLowerCase();
  return !["delivered", "cancelled", "canceled", "completed"].includes(s);
}

export function trackIdForOrder(o) {
  return o?.dbOrderId || o?.id || o?.orderId;
}

export function findLocalOrder(store, id) {
  if (!id) return null;
  return store.orders.find(o => o.id === id || o.dbOrderId === id) || null;
}

export function mapDbOrderToTrack(o) {
  const items = (o.orderItems || []).map(it => ({
    name: "Menu item", // localized in track UI via order items from cart
    qty: it.quantity,
    price: it.price,
  }));
  const statusKey = String(o.orderStatus || "").toUpperCase();
  const status = statusKey === "COMPLETED" ? "delivered" : statusKey === "CANCELED" ? "cancelled" : "confirmed";
  return {
    id: o.orderId,
    dbOrderId: o.orderId,
    shortId: "#" + String(o.orderId).slice(0, 8),
    items,
    total: o.totalAmount ?? items.reduce((s, i) => s + i.price * i.qty, 0),
    status,
    orderStatus: statusKey,
    address: { label: "Delivery address" },
    eta: 30,
    _stepIdx: stepFromOrderStatus(statusKey),
    fromApi: true,
    live: statusKey === "PENDING",
  };
}

export function normalizeLocalOrder(o) {
  if (o._stepIdx == null) {
    o._stepIdx = o.status === "delivered" ? 4 : o.status === "cancelled" ? -1 : 0;
  }
  return o;
}
