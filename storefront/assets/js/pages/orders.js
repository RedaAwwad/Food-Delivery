import { icon } from "../icons.js";
import { $, $$, money, toast, modal } from "../ui.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { footer } from "./home.js";
import { trackIdForOrder, isTrackableStatus } from "../orderTracking.js";
import { t } from "../i18n.js";

function dbStatus(s) {
  const v = String(s || "").toUpperCase();
  if (v === "COMPLETED" || v === "DELIVERED") return "delivered";
  if (v === "CANCELED" || v === "CANCELLED") return "cancelled";
  if (v === "PENDING") return "confirmed";
  return "active";
}
function mapDbOrder(o) {
  return {
    id: o.orderId,
    shortId: "#" + String(o.orderId).slice(0, 8),
    restaurant: o.restaurant?.restaurantName || t("yourOrder"),
    status: dbStatus(o.orderStatus),
    total: o.totalAmount ?? 0,
    when: o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
    items: (o.orderItems || []).map((it) => ({
      name: it.menuItem?.menuItemName || t("menuItem"),
      qty: it.quantity,
      price: it.price,
      img: it.menuItem?.menuItemImageUrl || "",
    })),
    db: true,
    live: dbStatus(o.orderStatus) !== "delivered" && dbStatus(o.orderStatus) !== "cancelled",
    dbOrderId: o.orderId,
  };
}

export async function renderOrders(root) {
  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("orders")}</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>${t("orderHistory")}</h2><p id="ordCount">${t("loading")}</p></div>
      <div class="row" id="ordFilter">${[
        ["All", "filterAll"], ["Active", "filterActive"], ["Delivered", "filterDelivered"], ["Cancelled", "filterCancelled"],
      ].map(([f, key], i) => `<button class="cat-pill ${i === 0 ? "active" : ""}" data-f="${f}">${t(key)}</button>`).join("")}</div>
    </div>
    <div id="ordList" style="display:flex;flex-direction:column;gap:16px">
      ${[0, 1, 2].map(() => `<div class="skel" style="height:150px"></div>`).join("")}
    </div>
  </div>${footer()}`;

  let real = [];
  if (api.isLoggedIn()) {
    try { real = (await api.myOrders()).map(mapDbOrder); } catch {}
  }
  // Local orders carry the exact totals the customer saw at checkout. Prefer them
  // over their database twin so the figures stay consistent across the app.
  const localDbIds = new Set(store.orders.map(o => o.dbOrderId).filter(Boolean));
  const localAll = store.orders.map(o => ({
    id: o.id, restaurant: t("yourOrder"), status: o.status, total: o.total, when: t("justNow"),
    items: o.items || [], live: true, db: !!o.dbOrderId,
  }));
  const realOnly = real.filter((r) => !localDbIds.has(r.id));
  const all = [...localAll, ...realOnly];

  const countEl = $("#ordCount", root);
  if (countEl) countEl.textContent = `${all.length} orders${real.length ? ` · ${real.length} saved to your account` : ""}`;

  let filter = "All";
  const paint = () => {
    const list = all.filter(o => filter === "All" || (filter === "Active" && !["delivered", "cancelled"].includes(o.status)) || o.status === filter.toLowerCase());
    $("#ordList").innerHTML = list.length ? list.map(card).join("") : `<div class="empty">${icon("receipt")}<p>${t("noOrders")}</p></div>`;
    bind(all);
  };
  $$("#ordFilter [data-f]", root).forEach(b => b.addEventListener("click", () => { filter = b.dataset.f; $$("#ordFilter [data-f]").forEach(x => x.classList.remove("active")); b.classList.add("active"); paint(); }));
  paint();
}

function statusBadge(s) {
  if (s === "delivered") return `<span class="badge badge-green">${icon("checkC")} ${t("delivered")}</span>`;
  if (s === "cancelled") return `<span class="badge badge-red">${icon("x")} ${t("cancelled")}</span>`;
  return `<span class="badge badge-brand">${icon("bike")} ${t("inProgress")}</span>`;
}

function itemDot(i) {
  const visual = i.img
    ? `background:url('${i.img}') center/cover`
    : `background:var(--brand-50);color:var(--brand-500);display:grid;place-items:center`;
  return `<div style="display:flex;align-items:center;gap:8px;background:var(--surface-2);border-radius:99px;padding:5px 12px 5px 5px;white-space:nowrap"><div style="width:30px;height:30px;border-radius:50%;${visual}">${i.img ? "" : icon("bag")}</div><span style="font-size:13px;font-weight:600">${i.qty}× ${i.name}</span></div>`;
}
function card(o) {
  return `<div class="card card-pad" data-order="${o.id}">
    <div class="row between wrapf" style="gap:12px;margin-bottom:14px">
      <div class="row" style="gap:12px"><div style="width:46px;height:46px;border-radius:12px;background:var(--brand-50);color:var(--brand-500);display:grid;place-items:center">${icon("bag")}</div>
      <div><div class="row" style="gap:8px;align-items:center"><strong style="font-size:16px">${o.restaurant}</strong>${o.db ? `<span class="badge badge-green" style="font-size:11px">${icon("checkC")} ${t("savedAccount")}</span>` : ""}</div><div class="muted" style="font-size:13px">${o.shortId || o.id} · ${o.when || ""}</div></div></div>
      ${statusBadge(o.status)}
    </div>
    <div class="row" style="gap:8px;overflow:auto;padding-bottom:4px">
      ${(o.items || []).map(itemDot).join("")}
    </div>
    <div class="divider"></div>
    <div class="row between">
      <strong style="font-size:16px">${money(o.total)}</strong>
      <div class="row" style="gap:10px">
        <button class="btn btn-ghost btn-sm" data-details="${o.id}">${icon("receipt")} ${t("details")}</button>
        ${o.live || isTrackableStatus(o.status) || o.status === "delivered" || o.status === "confirmed" ? `<a class="btn btn-outline btn-sm" href="#/track/${trackIdForOrder(o)}">${icon("truck")} ${t("track")}</a>` : ""}
        <button class="btn btn-primary btn-sm" data-reorder="${o.id}">${icon("repeat")} ${t("reorder")}</button>
      </div>
    </div>
  </div>`;
}

function bind(all) {
  $$("[data-reorder]").forEach(b => b.addEventListener("click", () => {
    const o = all.find(x => x.id === b.dataset.reorder);
    (o.items || []).forEach(i => store.addToCart({ mealId: i.name, name: i.name, img: i.img, price: i.price, qty: i.qty }));
    toast(t("itemsAddedCart"), "cart");
  }));
  $$("[data-details]").forEach(b => b.addEventListener("click", () => {
    const o = all.find(x => x.id === b.dataset.details);
    modal(`<div class="modal__body">
      <div class="row between" style="margin-bottom:16px"><h2 style="font-size:22px;font-weight:800">Order ${o.id}</h2>${statusBadge(o.status)}</div>
      <p class="muted" style="margin-bottom:16px">${o.restaurant} · ${o.when || ""}</p>
      ${(o.items || []).map(i => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)"><div class="row" style="gap:10px"><div style="width:44px;height:44px;border-radius:10px;${i.img ? `background:url('${i.img}') center/cover` : "background:var(--brand-50);color:var(--brand-500);display:grid;place-items:center"}">${i.img ? "" : icon("bag")}</div><span><strong>${i.qty}×</strong> ${i.name}</span></div><strong>${money(i.price * i.qty)}</strong></div>`).join("")}
      <div class="summary-row total" style="margin-top:14px"><span>Total</span><span>${money(o.total)}</span></div>
      <button class="btn btn-primary btn-block btn-lg" data-close style="margin-top:16px">${t("close")}</button>
    </div>`);
  }));
}
