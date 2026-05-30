import { icon } from "../icons.js";
import { $, $$, money } from "../ui.js";
import { store } from "../store.js";
import { computeTotals, summaryRowsHTML, lineTotal } from "../pricing.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";

let delivery = "delivery";

export async function renderCart(root) {
  paint(root);
}

function paint(root) {
  const items = store.cart;
  if (!items.length) {
    root.innerHTML = `<div class="wrap"><div class="empty" style="padding:90px 20px">${icon("cart")}<h2 style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px">${t("cartEmpty")}</h2><p>${t("cartEmptySub")}</p><a class="btn btn-primary btn-lg" href="#/restaurants" style="margin-top:18px">${t("browseRestaurants")}</a></div></div>${footer()}`;
    return;
  }
  const f = computeTotals(store.cart);
  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("cartTitle")}</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>${t("yourCart")}</h2><p>${t("itemsCount", { n: store.cartCount() })}</p></div><button class="btn btn-ghost btn-sm" id="clearCart">${icon("trash")} ${t("clearAll")}</button></div>

    <div class="with-side" style="grid-template-columns:1fr 380px">
      <div>
        <div class="card">
          ${items.map(cartLine).join("")}
        </div>
        <a class="btn btn-outline" href="#/restaurants" style="margin-top:16px">${icon("plus")} ${t("addMoreItems")}</a>
      </div>

      <div class="side-card">
        <div class="card card-pad">
          <h3 style="font-weight:800;margin-bottom:14px">${t("orderSummary")}</h3>
          <div class="row" style="gap:8px;margin-bottom:16px">
            <button class="cat-pill ${delivery === "delivery" ? "active" : ""}" data-del="delivery" style="flex:1;text-align:center">${icon("bike")} ${t("deliveryLabel")}</button>
            <button class="cat-pill ${delivery === "pickup" ? "active" : ""}" data-del="pickup" style="flex:1;text-align:center">${icon("bag")} ${t("pickup")}</button>
          </div>
          <div class="divider"></div>
          ${summaryRowsHTML(f, { deliveryLabel: delivery === "pickup" ? t("pickup") : t("deliveryLabel") })}
          <a class="btn btn-primary btn-block btn-lg" href="#/checkout" style="margin-top:10px">${t("checkoutBtn")} ${icon("arrowR")}</a>
          <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">${icon("shield")} ${t("secureCheckout")}</p>
        </div>
      </div>
    </div>
  </div>${footer()}`;

  $$("[data-q]", root).forEach(b => b.addEventListener("click", () => { const it = store.cart.find(i => i.key === b.dataset.key); if (it) store.setQty(b.dataset.key, it.qty + (+b.dataset.q)); paint(root); }));
  $$("[data-del-item]", root).forEach(b => b.addEventListener("click", () => { store.setQty(b.dataset.delItem, 0); paint(root); }));
  $("#clearCart", root).addEventListener("click", () => { store.clearCart(); paint(root); });
  $$("[data-del]", root).forEach(b => b.addEventListener("click", () => { delivery = b.dataset.del; paint(root); }));
}

function cartLine(i) {
  return `<div class="cart-line" style="padding:18px 20px">
    <div class="cart-line__img" style="width:80px;height:80px;background-image:url('${i.img}')"></div>
    <div class="cart-line__info">
      <h4 style="font-size:15.5px">${i.name}</h4>
      ${i.optionsLabel ? `<div class="sub">${i.optionsLabel}</div>` : ""}
      ${i.note ? `<div class="sub" style="font-style:italic">"${i.note}"</div>` : ""}
      <div class="row between" style="margin-top:10px">
        <div class="qty"><button data-q="-1" data-key="${i.key}">${icon("minus")}</button><span>${i.qty}</span><button data-q="1" data-key="${i.key}">${icon("plus")}</button></div>
        <div class="row" style="gap:14px"><strong style="font-size:16px">${money(lineTotal(i))}</strong><button class="hbtn" style="width:34px;height:34px;background:none" data-del-item="${i.key}">${icon("trash")}</button></div>
      </div>
    </div>
  </div>`;
}
