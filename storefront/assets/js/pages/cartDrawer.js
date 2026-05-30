import { icon } from "../icons.js";
import { $, $$, money } from "../ui.js";
import { store } from "../store.js";
import { computeTotals, summaryRowsHTML, lineTotal } from "../pricing.js";
import { t } from "../i18n.js";

export function openCartDrawer() {
  const ov = document.createElement("div");
  ov.className = "drawer-overlay";
  const close = () => { ov.remove(); dr.remove(); };
  const dr = document.createElement("aside");
  dr.className = "drawer";
  document.body.appendChild(ov);
  document.body.appendChild(dr);
  ov.addEventListener("click", close);

  function render() {
    const items = store.cart;
    dr.innerHTML = `
      <div class="drawer__head"><h3>${t("drawerCart")} ${items.length ? `<span class="muted" style="font-size:14px;font-weight:600">(${store.cartCount()})</span>` : ""}</h3>
        <button class="hbtn" id="drClose">${icon("x")}</button></div>
      <div class="drawer__body">
        ${items.length ? items.map(cartLine).join("") : `<div class="empty">${icon("cart")}<p>${t("drawerEmpty")}</p><p style="font-size:13px">${t("drawerEmptySub")}</p></div>`}
      </div>
      ${items.length ? `<div class="drawer__foot">
        ${summaryRowsHTML(computeTotals(store.cart))}
        <a class="btn btn-primary btn-block btn-lg" href="#/checkout" id="goCheckout" style="margin-top:8px">${t("goCheckout")} ${icon("arrowR")}</a>
        <a class="btn btn-ghost btn-block" href="#/cart" id="goCart" style="margin-top:10px">${t("viewFullCart")}</a>
      </div>` : `<div class="drawer__foot"><a class="btn btn-primary btn-block btn-lg" href="#/restaurants">${t("browseRestaurants")}</a></div>`}`;
    $("#drClose", dr).addEventListener("click", close);
    $$("[data-q]", dr).forEach(b => b.addEventListener("click", () => { const it = store.cart.find(i => i.key === b.dataset.key); if (it) store.setQty(b.dataset.key, it.qty + (+b.dataset.q)); render(); }));
    $$("[data-del]", dr).forEach(b => b.addEventListener("click", () => { store.setQty(b.dataset.del, 0); render(); }));
    $$("a[href]", dr).forEach(a => a.addEventListener("click", close));
  }
  render();
}

function cartLine(i) {
  return `<div class="cart-line">
    <div class="cart-line__img" style="background-image:url('${i.img}')"></div>
    <div class="cart-line__info">
      <h4>${i.name}</h4>
      ${i.optionsLabel ? `<div class="sub">${i.optionsLabel}</div>` : ""}
      <div class="row between" style="margin-top:8px">
        <div class="qty"><button data-q="-1" data-key="${i.key}">${icon("minus")}</button><span>${i.qty}</span><button data-q="1" data-key="${i.key}">${icon("plus")}</button></div>
        <strong>${money(lineTotal(i))}</strong>
      </div>
    </div>
    <button class="hbtn" style="width:32px;height:32px;background:none" data-del="${i.key}">${icon("trash")}</button>
  </div>`;
}
