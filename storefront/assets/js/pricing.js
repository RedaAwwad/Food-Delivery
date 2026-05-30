// Single source of truth for ALL order pricing across the storefront.
// Menu, cart, cart drawer, checkout and the confirmation page must use these
// helpers so a given cart always produces the exact same totals everywhere.
import { money } from "./ui.js";
import { t } from "./i18n.js";

// IMPORTANT: the backend stores an order's `totalAmount` as the pure merchandise
// total (sum of price * quantity) with no extra fees. To keep the page and the
// database in perfect agreement, the order total here is the same merchandise
// subtotal. Delivery is shown as free and there is no separate tax line, so what
// the customer sees is exactly what gets saved.
export const PRICING = {
  taxRate: 0,
  standardDelivery: 0,
  expressSurcharge: 0,
  freeDeliveryOver: 0,
};

// Round to 2 decimals safely (guards against NaN / floating-point drift).
export function round2(n) {
  const x = Number(n);
  if (!isFinite(x)) return 0;
  return Math.round((x + Number.EPSILON) * 100) / 100;
}

export function lineTotal(item) {
  return round2((Number(item?.price) || 0) * (Number(item?.qty) || 0));
}

export function cartSubtotal(cart = []) {
  return round2((cart || []).reduce((s, i) => s + lineTotal(i), 0));
}

// Compute a validated price breakdown for a cart. The total equals the merchandise
// subtotal so it always matches the order's `totalAmount` in the database.
export function computeTotals(cart = []) {
  const subtotal = cartSubtotal(cart);
  return { subtotal, deliveryFee: 0, tax: 0, tip: 0, discount: 0, total: subtotal };
}

// Shared summary markup so every page renders identical rows in the same order.
export function summaryRowsHTML(totals, { deliveryLabel } = {}) {
  const del = deliveryLabel ?? t("deliveryLabel");
  return `
    <div class="summary-row"><span>${t("subtotal")}</span><span>${money(totals.subtotal)}</span></div>
    <div class="summary-row"><span>${del}</span><span>${t("free")}</span></div>
    <div class="summary-row total"><span>${t("total")}</span><span>${money(totals.total)}</span></div>`;
}
