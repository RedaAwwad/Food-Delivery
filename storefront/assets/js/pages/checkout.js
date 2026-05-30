import { icon } from "../icons.js";
import { $, $$, money, toast } from "../ui.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { computeTotals, summaryRowsHTML, lineTotal } from "../pricing.js";
import { initStripe, mountCardElement, unmountCardElement, confirmCardPayment, isStripeReady } from "../stripePay.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";

let sel = { addr: null, pay: null, delivery: "delivery" };
let stripeEnabled = false;

export async function renderCheckout(root) {
  const items = store.cart;
  if (!items.length) { location.hash = "#/cart"; return; }

  const cfg = await api.publicConfig();
  stripeEnabled = !!cfg.stripePublishableKey;
  if (stripeEnabled) await initStripe(cfg.stripePublishableKey);

  if (!sel.addr) sel.addr = (store.addresses.find(a => a.default) || store.addresses[0])?.id;
  if (!sel.pay) {
    sel.pay = stripeEnabled ? "stripe" : (store.cards.find(c => c.default) || store.cards[0])?.id || "cod";
  }

  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/cart">${t("cartTitle")}</a>${icon("chevR")}<span>${t("checkoutPage")}</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>${t("checkoutPage")}</h2><p>${t("checkoutSub")}</p></div></div>

    <div class="with-side" style="grid-template-columns:1fr 380px">
      <div>
        <div class="card card-pad" style="margin-bottom:20px">
          <div class="row between" style="margin-bottom:14px"><h3 style="font-weight:800">${icon("pin")} ${t("deliveryAddressTitle")}</h3><button class="btn btn-ghost btn-sm" id="addAddr">${icon("plus")} ${t("newAddress")}</button></div>
          <div id="addrList">${store.addresses.map(addrTile).join("")}</div>
        </div>

        <div class="card card-pad" style="margin-bottom:20px">
          <h3 style="font-weight:800;margin-bottom:14px">${icon("clock")} ${t("deliveryOptions")}</h3>
          <div class="row" style="gap:10px">
            <button class="cat-pill ${sel.delivery === "delivery" ? "active" : ""}" data-dl="delivery" style="flex:1;text-align:center;padding:12px">${icon("bike")} ${t("standardDelivery")}</button>
            <button class="cat-pill ${sel.delivery === "express" ? "active" : ""}" data-dl="express" style="flex:1;text-align:center;padding:12px">${icon("flame")} ${t("expressDelivery")}</button>
          </div>
        </div>

        <div class="card card-pad">
          <h3 style="font-weight:800;margin-bottom:14px">${icon("card")} ${t("paymentMethod")}</h3>
          <div id="payList">
            ${stripeEnabled ? payOption("stripe", "card", t("cardStripe"), t("cardStripeSub")) : ""}
            ${store.cards.map(payTile).join("")}
            ${payOption("cod", "cash", t("cashOnDelivery"), t("codSub"))}
          </div>
          <div id="stripePayBox" class="stripe-pay" style="display:none;margin-top:16px">
            <label style="font-weight:700;font-size:13px;display:block;margin-bottom:8px">${t("cardDetails")}</label>
            <div id="stripe-card-element"></div>
            <p id="stripeCardErr" class="stripe-pay__err"></p>
            <p class="muted" style="font-size:12px;margin-top:10px">${icon("shield")} ${t("stripeTestHint")}</p>
          </div>
        </div>
      </div>

      <div class="side-card">
        <div class="card card-pad">
          <h3 style="font-weight:800;margin-bottom:14px">${t("orderSummary")}</h3>
          <div style="max-height:220px;overflow:auto;margin-bottom:10px">
            ${items.map(i => `<div class="row between" style="padding:8px 0;font-size:14px"><span><strong>${i.qty}×</strong> ${i.name}</span><span>${money(lineTotal(i))}</span></div>`).join("")}
          </div>
          <div class="divider"></div>
          <div id="totals"></div>
          <button class="btn btn-primary btn-block btn-lg" id="placeOrder" style="margin-top:12px">${t("placeOrder")} · <span id="grand"></span></button>
          <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">${icon("shield")} ${t("securePayment")}</p>
        </div>
      </div>
    </div>
  </div>${footer()}`;

  paintTotals();
  syncStripeUI(root);

  $$("[data-addr]", root).forEach(t => t.addEventListener("click", () => { sel.addr = t.dataset.addr; markSel("addr"); }));
  $$("[data-pay]", root).forEach(t => t.addEventListener("click", () => {
    sel.pay = t.dataset.pay;
    markSel("pay");
    syncStripeUI(root);
  }));
  $$("[data-dl]", root).forEach(b => b.addEventListener("click", () => { sel.delivery = b.dataset.dl; $$("[data-dl]").forEach(x => x.classList.remove("active")); b.classList.add("active"); paintTotals(); }));
  $("#addAddr", root).addEventListener("click", () => toast(t("addressDemo")));
  $("#placeOrder", root).addEventListener("click", place);
  markSel("addr"); markSel("pay");
}

function syncStripeUI(root) {
  const box = $("#stripePayBox", root);
  const err = $("#stripeCardErr", root);
  if (!box) return;
  const show = sel.pay === "stripe" && stripeEnabled;
  box.style.display = show ? "block" : "none";
  if (err) err.textContent = "";
  if (show) {
    const el = $("#stripe-card-element", root);
    if (el) mountCardElement(el);
  } else {
    unmountCardElement();
  }
}

function addrTile(a) {
  return `<div class="select-tile" data-addr="${a.id}"><div class="ic">${icon(a.icon || "home")}</div>
    <div style="flex:1"><div class="row between"><strong>${a.label}</strong>${a.default ? `<span class="badge badge-neutral">Default</span>` : ""}</div>
    <div class="muted" style="font-size:13px">${a.line}, ${a.city}</div></div></div>`;
}
function payTile(c) {
  return `<div class="select-tile" data-pay="${c.id}"><div class="ic">${icon("card")}</div>
    <div style="flex:1"><strong>${c.brand} •••• ${c.last4}</strong><div class="muted" style="font-size:13px">Expires ${c.exp}</div></div></div>`;
}
function payOption(id, ic, t, s) {
  return `<div class="select-tile" data-pay="${id}"><div class="ic">${icon(ic)}</div><div style="flex:1"><strong>${t}</strong><div class="muted" style="font-size:13px">${s}</div></div></div>`;
}
function markSel(kind) {
  $$(`[data-${kind}]`).forEach(t => t.classList.toggle("active", t.dataset[kind] === sel[kind]));
}
function calc() {
  return computeTotals(store.cart);
}
function paintTotals() {
  const f = calc();
  $("#totals").innerHTML = summaryRowsHTML(f, {
    deliveryLabel: sel.delivery === "pickup" ? t("pickup") : t("deliveryLabel"),
  });
  $("#grand").textContent = money(f.total);
}

function paymentProviderForSelection() {
  if (sel.pay === "stripe") return "stripe";
  if (sel.pay === "cod") return "CASH_ON_DELIVERY";
  return "CASH_ON_DELIVERY";
}

function resetPlaceBtn(btn) {
  btn.disabled = false;
  btn.innerHTML = `${t("placeOrder")} · <span id="grand">${money(calc().total)}</span>`;
}

async function place() {
  const btn = $("#placeOrder");
  btn.disabled = true;
  btn.textContent = t("placingOrder");

  const totals = calc();
  let items = store.cart.map(i => ({ name: i.name, qty: i.qty, price: i.price, img: i.img }));
  let total = totals.total;
  const addr = store.addresses.find(a => a.id === sel.addr);
  const useStripe = sel.pay === "stripe" && stripeEnabled;

  if (useStripe && !api.isLoggedIn()) {
    toast(t("signInForCard"), "user");
    sessionStorage.setItem("shop_return", "#/checkout");
    resetPlaceBtn(btn);
    setTimeout(() => { location.hash = "#/login"; }, 600);
    return;
  }

  if (useStripe && !isStripeReady()) {
    toast(t("enterCardDetails"), "card");
    resetPlaceBtn(btn);
    return;
  }

  let dbOrderId = null;
  let paymentStatus = useStripe ? "paid" : "confirmed";

  if (api.isLoggedIn()) {
    try {
      const provider = paymentProviderForSelection();
      const dbResult = await api.placeRealOrder(store.cart, { paymentProvider: provider });

      if (useStripe) {
        if (!dbResult.clientSecret) {
          throw new Error("No payment session from server. Check STRIPE_SECRET_KEY in .env");
        }
        btn.textContent = t("processingPayment");
        const { error, paymentIntent } = await confirmCardPayment(dbResult.clientSecret);
        if (error) {
          const errEl = $("#stripeCardErr");
          if (errEl) errEl.textContent = error.message || "Payment failed";
          toast(error.message || t("paymentFailed"), "x");
          resetPlaceBtn(btn);
          return;
        }
        if (paymentIntent?.status !== "succeeded") {
          toast(`Payment status: ${paymentIntent?.status || "unknown"}`, "info");
          paymentStatus = "pending";
        } else {
          // Confirm in DB immediately (webhook may not reach localhost if STRIPE_WEBHOOK_SECRET is wrong).
          try {
            await api.confirmStripePayment(dbResult.orderId);
            paymentStatus = "confirmed";
          } catch (confirmErr) {
            console.warn("confirm-payment:", confirmErr);
            paymentStatus = "paid";
          }
          toast(t("paymentSuccess"), "checkC");
        }
      }

      dbOrderId = dbResult?.orderId || null;
      if (dbResult?.items?.length) items = dbResult.items;
      if (dbResult) total = dbResult.totalAmount;
    } catch (e) {
      if (useStripe) {
        toast(e.message || "Payment failed", "x");
        resetPlaceBtn(btn);
        return;
      }
      toast(e.code === "no-items" ? "No orderable items to save — saved locally" : "Couldn't reach server — saved locally", "info");
    }
  } else if (useStripe) {
    toast(t("signInForCard"), "user");
    resetPlaceBtn(btn);
    return;
  } else {
    toast(t("loginToSave"), "info");
  }

  const order = store.placeOrder({
    items,
    totals: { subtotal: total, deliveryFee: 0, tax: 0, tip: 0, discount: 0, total },
    total,
    address: addr,
    payment: sel.pay,
    delivery: sel.delivery,
    eta: sel.delivery === "express" ? 15 : 30,
    dbOrderId,
    status: paymentStatus,
  });
  store.clearCart();
  unmountCardElement();
  toast(dbOrderId ? (useStripe ? t("orderPaidSaved") : t("orderPlacedSaved")) : t("orderPlaced"), "checkC");
  setTimeout(() => location.hash = `#/confirm/${order.id}`, 400);
}
