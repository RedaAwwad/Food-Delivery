import { icon } from "../icons.js";
import { money } from "../ui.js";
import { store } from "../store.js";
import { computeTotals, summaryRowsHTML, lineTotal } from "../pricing.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";

export async function renderConfirm(root, id) {
  const order = store.orders.find(o => o.id === id) || store.orders[0];
  if (!order) { location.hash = "#/"; return; }

  const payLabel = order.payment === "cod" ? t("payCod")
    : order.payment === "stripe" ? t("payStripe")
    : order.payment === "wallet" ? t("payWallet") : t("payCard");
  const addr = order.address;
  const items = order.items || [];
  // The stored breakdown mirrors the database order; fall back to recomputing
  // from the saved items for older local orders.
  const totals = order.totals || computeTotals(items);

  root.innerHTML = `
  <div class="confirm">
    <div class="confirm__halo"></div>
    <div class="wrap confirm__inner">
      <div class="confirm-hero">
        <div class="confirm-check">
          <svg viewBox="0 0 52 52" class="confirm-check__svg"><circle cx="26" cy="26" r="24" class="cc-ring"/><path d="M16 27l7 7 13-14" class="cc-tick"/></svg>
          <span class="confirm-spark s1">${icon("sparkles")}</span>
          <span class="confirm-spark s2">${icon("gift")}</span>
          <span class="confirm-spark s3">${icon("flame")}</span>
        </div>
        <h1>${t("orderConfirmed")}</h1>
        <p>${order.payment === "stripe" && order.status === "paid"
          ? t("paymentReceived")
          : t("thankYou")}</p>
        <div class="confirm-id">
          <span>${t("order")}</span><strong>${order.id}</strong>
          ${order.dbOrderId ? `<span class="badge badge-green" style="margin-left:6px">${icon("checkC")} ${t("savedAccount")}</span>` : ""}
        </div>
      </div>

      <div class="confirm-grid">
        <div class="card card-pad confirm-eta">
          <div class="confirm-eta__icon">${icon("bike")}</div>
          <div>
            <div class="muted" style="font-size:13px;font-weight:700">${t("estimatedArrival")}</div>
            <div class="confirm-eta__time">${order.eta || 30} ${t("min")}</div>
          </div>
          <div class="confirm-steps">
            ${[t("confirmed"), t("preparing"), t("onTheWay"), t("delivered")].map((s, i) =>
              `<div class="cstep ${i === 0 ? "done" : ""}"><span class="dot"></span>${s}</div>`).join("")}
          </div>
        </div>

        <div class="card card-pad">
          <h3 style="font-weight:800;margin-bottom:14px">${icon("receipt")} ${t("orderSummary")}</h3>
          <div class="confirm-items">
            ${items.map(i => `<div class="row between" style="padding:8px 0;font-size:14px">
              <span class="row" style="gap:10px">${i.img ? `<span class="ci-thumb" style="background-image:url('${i.img}')"></span>` : `<span class="ci-thumb ci-thumb--ph">${icon("bag")}</span>`}<span><strong>${i.qty}×</strong> ${i.name}</span></span>
              <strong>${money(lineTotal(i))}</strong></div>`).join("")}
          </div>
          <div class="divider"></div>
          ${summaryRowsHTML(totals, { deliveryLabel: order.delivery === "pickup" ? t("pickup") : t("deliveryLabel") })}
          <div class="confirm-meta">
            <div>${icon("pin")} <span>${addr ? `${addr.line}, ${addr.city}` : t("pickup")}</span></div>
            <div>${order.payment === "cod" ? icon("cash") : icon("card")} <span>${payLabel}</span></div>
          </div>
        </div>
      </div>

      <div class="confirm-actions">
        <a class="btn btn-primary btn-lg" href="#/track/${order.dbOrderId || order.id}">${icon("truck")} ${t("trackOrder")}</a>
        <a class="btn btn-outline btn-lg" href="#/">${icon("home")} ${t("backHome")}</a>
      </div>
    </div>
  </div>${footer()}`;
}
