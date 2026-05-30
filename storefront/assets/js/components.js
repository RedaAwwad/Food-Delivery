import { icon } from "./icons.js";
import { $, $$, money, stars, toast, modal } from "./ui.js";
import { store } from "./store.js";
import { t } from "./i18n.js";
import { requireShopAuth } from "./authGuard.js";

export function restaurantCard(r) {
  const fav = store.isFavRest(r.id);
  return `<div class="rcard" data-rest="${r.id}">
    <div class="rcard__img" style="background-image:url('${r.img}')">
      ${r.promo ? `<span class="badge ${r.promo.includes("OFF") ? "badge-red" : "badge-green"} promo">${r.promo}</span>` : ""}
      <button class="fav ${fav ? "on" : ""}" data-favrest="${r.id}">${icon("heart")}</button>
      <span class="deliver">${icon("clock")} ${r.eta}</span>
    </div>
    <div class="rcard__body">
      <div class="top"><h3>${r.name}</h3>${stars(r.rating)}</div>
      <div class="rcard__meta">
        <span>${(r.cuisines || []).join(" · ")}</span>
      </div>
      <div class="rcard__meta" style="margin-top:7px">
        <span class="tag">${icon("bike")} ${r.fee ? money(r.fee) : "Free"}</span><span class="dot"></span>
        <span class="tag">${icon("pin")} ${r.distance}</span><span class="dot"></span>
        <span>${r.price}</span>
      </div>
    </div>
  </div>`;
}

export function mealCard(m, opts = {}) {
  const fav = store.isFavMeal(m.id);
  const disc = m.was ? Math.round((1 - m.price / m.was) * 100) : 0;
  return `<div class="meal" data-meal="${m.id}">
    <div class="meal__img" style="background-image:url('${m.img}')">
      ${disc ? `<span class="badge badge-red disc">-${disc}%</span>` : (m.popular ? `<span class="badge badge-brand disc">${icon("flame")} Popular</span>` : "")}
      <button class="fav ${fav ? "on" : ""}" data-favmeal="${m.id}">${icon("heart")}</button>
    </div>
    <div class="meal__body">
      <h4>${m.name}</h4>
      <div class="desc">${m.desc || ""}</div>
      <div class="meal__foot">
        <div class="price">${m.was ? `<span class="was">${money(m.was)}</span>` : ""}${money(m.price)}</div>
        <button class="add-btn" data-add="${m.id}">${icon("plus")}</button>
      </div>
    </div>
  </div>`;
}

export function mealRow(m) {
  return `<div class="meal-row" data-meal="${m.id}">
    <div class="meal-row__info">
      <h4>${m.name} ${m.veg ? `<span class="badge badge-green" style="vertical-align:middle">${icon("leaf")} Veg</span>` : ""}</h4>
      <div class="desc">${m.desc || ""}</div>
      <div class="row" style="gap:10px"><span class="price">${money(m.price)}</span>${stars(m.rating)}</div>
    </div>
    <div class="meal-row__img" style="background-image:url('${m.img}')">
      <button class="add-btn" data-add="${m.id}">${icon("plus")}</button>
    </div>
  </div>`;
}

// Find a meal by id from a provided list
export function bindCards(root, meals, onRestClick) {
  const find = (id) => meals.find(m => String(m.id) === String(id));
  $$("[data-add]", root).forEach(b =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!requireShopAuth()) return;
      openMealModal(find(b.dataset.add));
    })
  );
  $$("[data-meal]", root).forEach(c =>
    c.addEventListener("click", (e) => {
      if (e.target.closest("[data-add],[data-favmeal]")) return;
      if (!requireShopAuth()) return;
      openMealModal(find(c.dataset.meal));
    })
  );
  $$("[data-favmeal]", root).forEach(b =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!requireShopAuth()) return;
      store.toggleFavMeal(b.dataset.favmeal);
      b.classList.toggle("on");
      toast(store.isFavMeal(b.dataset.favmeal) ? t("addedToFavorites") : t("removed"), "heart");
    })
  );
  $$("[data-favrest]", root).forEach(b =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!requireShopAuth()) return;
      store.toggleFavRest(b.dataset.favrest);
      b.classList.toggle("on");
      toast(store.isFavRest(b.dataset.favrest) ? t("savedRestaurant") : t("removed"), "heart");
    })
  );
  $$("[data-rest]", root).forEach(c =>
    c.addEventListener("click", (e) => {
      if (e.target.closest("[data-favrest]")) return;
      if (!requireShopAuth()) return;
      (onRestClick || ((id) => (location.hash = `#/restaurant/${id}`)))(c.dataset.rest);
    })
  );
}

export function openMealModal(m) {
  if (!m) return;
  if (!requireShopAuth()) return;
  const o = m.options || { size: [], extras: [] };
  const m2 = modal(`
    <div class="modal__img" style="background-image:url('${m.img}')">
      <button class="modal__close" data-close>${icon("x")}</button>
    </div>
    <div class="modal__body">
      <div class="row between" style="align-items:flex-start">
        <div><h2 style="font-size:24px;font-weight:800;letter-spacing:-.5px">${m.name}</h2>
        <div class="row" style="gap:10px;margin-top:6px">${stars(m.rating)}<span class="muted">·</span><span class="muted">${t("soldCount", { n: m.sold || 0 })}</span></div></div>
        <div class="price" style="font-size:22px">${money(m.price)}</div>
      </div>
      <p class="muted" style="margin:12px 0 18px">${m.desc || ""}</p>
      ${o.size?.length ? `<h4 style="font-weight:800;margin-bottom:6px">${t("chooseSize")}</h4>
        ${o.size.map((s, i) => `<div class="opt-row"><label><input type="radio" name="size" value="${i}" ${i === 0 ? "checked" : ""}> ${s.n}</label><span class="muted">${s.p ? "+" + money(s.p) : t("included")}</span></div>`).join("")}` : ""}
      ${o.extras?.length ? `<h4 style="font-weight:800;margin:18px 0 6px">${t("addExtras")}</h4>
        ${o.extras.map((x, i) => `<div class="opt-row"><label><input type="checkbox" name="extra" value="${i}"> ${x.n}</label><span class="muted">+${money(x.p)}</span></div>`).join("")}` : ""}
      <div class="field" style="margin-top:18px"><label>${t("specialInstructions")}</label><textarea class="input" id="mealNote" placeholder="${t("mealNotePh")}"></textarea></div>
      <div class="row between" style="margin-top:20px;gap:16px">
        <div class="qty" style="height:50px"><button data-q="-1">${icon("minus")}</button><span id="mq">1</span><button data-q="1">${icon("plus")}</button></div>
        <button class="btn btn-primary btn-lg" style="flex:1" id="addToCart"><span id="addLabel">${t("addToCart")}</span></button>
      </div>
    </div>`, "lg");

  let qty = 1;
  const sizes = o.size || [], extras = o.extras || [];
  const calc = () => {
    const si = +($('input[name=size]:checked', m2.el)?.value ?? -1);
    const sp = si >= 0 ? (sizes[si]?.p || 0) : 0;
    const ex = $$('input[name=extra]:checked', m2.el).reduce((s, e) => s + (extras[+e.value]?.p || 0), 0);
    return (m.price + sp + ex) * qty;
  };
  const refresh = () => { $("#mq", m2.el).textContent = qty; $("#addLabel", m2.el).textContent = t("addQtyPrice", { qty, price: money(calc()) }); };
  $$("[data-q]", m2.el).forEach(b => b.addEventListener("click", () => { qty = Math.max(1, qty + (+b.dataset.q)); refresh(); }));
  $$('input[name=size],input[name=extra]', m2.el).forEach(i => i.addEventListener("change", refresh));
  refresh();
  $("#addToCart", m2.el).addEventListener("click", () => {
    if (!requireShopAuth()) return;
    const si = +($('input[name=size]:checked', m2.el)?.value ?? -1);
    const sizeLabel = si >= 0 ? sizes[si]?.n : "";
    const exSel = $$('input[name=extra]:checked', m2.el).map(e => extras[+e.value]?.n);
    const unit = calc() / qty;
    const optionsLabel = [sizeLabel, ...exSel].filter(Boolean).join(", ");
    const added = store.addToCart({
      mealId: m.menuItemId || m.id, name: m.name, img: m.img, price: unit, qty, optionsLabel,
      note: $("#mealNote", m2.el)?.value || "",
      restaurantId: m.restaurantId, restaurantName: m.restaurantName, stockQuantity: m.stockQuantity,
    });
    if (added === false) return;
    toast(t("addedToCart", { qty, name: m.name }), "cart");
    m2.close();
  });
}

export function sectionHead(title, sub, link, linkLabel) {
  if (!linkLabel) linkLabel = t("seeAll");
  return `<div class="section__head"><div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div>${link ? `<a class="see-all" href="${link}">${linkLabel} ${icon("arrowR")}</a>` : ""}</div>`;
}
