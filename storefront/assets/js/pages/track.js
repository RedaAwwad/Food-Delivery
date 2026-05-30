import { icon } from "../icons.js";
import { $, money, avatarEl, toast } from "../ui.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { footer } from "./home.js";
import { t, trackingStepLabels } from "../i18n.js";
import {
  findLocalOrder,
  mapDbOrderToTrack,
  normalizeLocalOrder,
  stepFromTracking,
  stepFromOrderStatus,
} from "../orderTracking.js";

let timer;

async function resolveOrder(id) {
  const local = findLocalOrder(store, id);
  if (local) return normalizeLocalOrder({ ...local });

  if (api.isLoggedIn() && id) {
    try {
      const o = await api.getOrder(id);
      const order = mapDbOrderToTrack(o);
      try {
        const tr = await api.getOrderTracking(id);
        const steps = tr?.trackingStatus ?? tr?.data?.trackingStatus;
        const fromTrack = stepFromTracking(steps);
        if (fromTrack != null) order._stepIdx = fromTrack;
      } catch {
        order._stepIdx = stepFromOrderStatus(o.orderStatus);
      }
      return order;
    } catch (e) {
      console.warn("track load:", e);
    }
  }

  if (!id && store.orders.length) return normalizeLocalOrder({ ...store.orders[0] });

  if (api.isLoggedIn() && !id) {
    try {
      const list = await api.myOrders();
      const pending = list.find(o => String(o.orderStatus).toUpperCase() === "PENDING");
      const pick = pending || list[0];
      if (pick) return mapDbOrderToTrack(pick);
    } catch {}
  }

  return null;
}

export async function renderTrack(root, id) {
  if (timer) clearInterval(timer);

  const order = await resolveOrder(id);
  const STEPS = trackingStepLabels();

  if (!order) {
    root.innerHTML = `<div class="wrap"><div class="empty" style="padding:90px 20px">${icon("truck")}<h2 style="font-size:22px;font-weight:800;color:var(--text)">${t("noActiveOrders")}</h2><p>${t("placeToTrack")}</p><a class="btn btn-primary btn-lg" href="#/restaurants" style="margin-top:18px">${t("orderNow")}</a><a class="btn btn-outline btn-lg" href="#/orders" style="margin-top:10px">${t("viewOrderHistory")}</a></div></div>${footer()}`;
    return;
  }

  if (order._stepIdx < 0 || order.status === "cancelled") {
    root.innerHTML = `<div class="wrap"><div class="empty" style="padding:90px 20px">${icon("x")}<h2 style="font-size:22px;font-weight:800">${t("orderCancelled")}</h2><p>${t("order")} ${order.shortId || order.id}</p><a class="btn btn-primary btn-lg" href="#/restaurants" style="margin-top:18px">${t("orderAgain")}</a></div></div>${footer()}`;
    return;
  }

  if (order._stepIdx == null) order._stepIdx = 0;

  const MAP = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=1000&q=70";
  const displayId = order.shortId || order.id;
  const simulate = !order.fromApi;

  function paint() {
    const idx = Math.min(order._stepIdx, STEPS.length - 1);
    const cur = STEPS[idx];
    const eta = Math.max(1, (order.eta || 30) - idx * 6);

    root.innerHTML = `
    <div class="wrap">
      <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<a href="#/orders">${t("orders")}</a>${icon("chevR")}<span>${t("track")} ${displayId}</span></div>
      <div class="with-side" style="grid-template-columns:1fr 400px;margin-top:6px">
        <div>
          <div class="card" style="overflow:hidden">
            <div class="track-map" style="background-image:linear-gradient(rgba(10,12,16,.05),rgba(10,12,16,.25)),url('${MAP}')">
              <div style="position:absolute;top:18px;left:18px;background:var(--surface);padding:10px 16px;border-radius:99px;box-shadow:var(--shadow-md);font-weight:800">${icon("clock")} ${idx >= 4 ? t("deliveredEta") : t("minAway", { n: eta })}</div>
              <div class="route-dot" style="position:absolute;left:18%;top:62%;color:var(--brand-500)">${icon("pin")}</div>
              <div class="route-dot" style="position:absolute;right:20%;top:28%;color:var(--green-500)">${icon("home")}</div>
            </div>
            <div class="card-pad">
              <div class="driver-chip">
                ${avatarEl("https://i.pravatar.cc/80?u=driver", "Mike", "avatar", 52)}
                <div style="flex:1"><strong>Mike Anderson</strong><div class="muted" style="font-size:13px">${icon("star")} 4.9 · ${t("courier")}</div></div>
                <button class="hbtn" style="background:var(--surface-2)">${icon("phone")}</button>
                <button class="hbtn" style="background:var(--surface-2)">${icon("mail")}</button>
              </div>
            </div>
          </div>

          <div class="card card-pad" style="margin-top:20px">
            <h3 style="font-weight:800;margin-bottom:20px">${t("orderProgress")}</h3>
            ${STEPS.map((s, i) => `<div class="track-step ${i < idx ? "done" : ""} ${i === idx ? "active" : ""}">
              ${i < STEPS.length - 1 ? `<div class="ln"></div>` : ""}
              <div class="pt">${i <= idx ? icon(i < idx ? "check" : s[3]) : icon(s[3])}</div>
              <div><h4>${s[1]}</h4><p>${s[2]}${i === idx ? ` · <span style="color:var(--brand-500);font-weight:700">${t("now")}</span>` : ""}</p></div>
            </div>`).join("")}
          </div>
        </div>

        <div class="side-card">
          <div class="card card-pad">
            <div class="row between" style="margin-bottom:6px"><h3 style="font-weight:800">${t("order")} ${displayId}</h3><span class="badge badge-green">${cur[1]}</span></div>
            <p class="muted" style="font-size:13px;margin-bottom:14px">${t("deliveringTo")}</p>
            <div class="divider"></div>
            ${(order.items || []).map(i => `<div class="row between" style="padding:8px 0;font-size:14px"><span><strong>${i.qty}×</strong> ${i.name}</span><span>${money(i.price * i.qty)}</span></div>`).join("")}
            <div class="summary-row total" style="margin-top:8px"><span>${t("totalPaid")}</span><span>${money(order.total)}</span></div>
            <a class="btn btn-outline btn-block" href="#/checkin" style="margin-top:14px">${icon("qr")} ${t("checkinPickup")}</a>
            ${idx >= 4 ? `<a class="btn btn-primary btn-block" href="#/restaurants" style="margin-top:10px">${t("orderAgain")}</a>` : simulate ? `<button class="btn btn-ghost btn-block" id="advance" style="margin-top:10px">${t("simulateStep")}</button>` : `<p class="muted" style="font-size:12px;margin-top:10px;text-align:center">${icon("clock")} ${t("statusFromRestaurant")}</p>`}
          </div>
          <div class="card card-pad" style="margin-top:16px;text-align:center">
            <p style="font-weight:700;margin-bottom:4px">${t("needHelp")}</p>
            <p class="muted" style="font-size:13px;margin-bottom:12px">${t("support247")}</p>
            <button class="btn btn-ghost btn-block">${icon("phone")} ${t("contactSupport")}</button>
          </div>
        </div>
      </div>
    </div>${footer()}`;

    $("#advance", root)?.addEventListener("click", () => advance());
  }

  function advance() {
    if (order._stepIdx < STEPS.length - 1) {
      order._stepIdx++;
      order.status = STEPS[order._stepIdx][0];
      store.save();
      if (order._stepIdx === STEPS.length - 1) {
        clearInterval(timer);
        toast(t("orderDeliveredToast"), "checkC");
      }
      paint();
    }
  }

  paint();

  if (simulate && order._stepIdx < STEPS.length - 1) {
    timer = setInterval(() => {
      if (!document.body.contains(root)) { clearInterval(timer); return; }
      advance();
    }, 7000);
  } else if (order.fromApi && order._stepIdx < STEPS.length - 1) {
    const pollId = order.dbOrderId || order.id;
    timer = setInterval(async () => {
      if (!document.body.contains(root)) { clearInterval(timer); return; }
      try {
        const tr = await api.getOrderTracking(pollId);
        const idx = stepFromTracking(tr?.trackingStatus);
        if (idx != null && idx !== order._stepIdx) {
          order._stepIdx = idx;
          if (idx >= STEPS.length - 1) order.status = "delivered";
          paint();
        }
      } catch {
        try {
          const o = await api.getOrder(pollId);
          const idx = stepFromOrderStatus(o.orderStatus);
          if (idx !== order._stepIdx) { order._stepIdx = idx; paint(); }
        } catch {}
      }
    }, 12000);
  }
}
