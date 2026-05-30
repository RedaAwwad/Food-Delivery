import { icon } from "../icons.js";
import { $, $$, money, stars, toast } from "../ui.js";
import { api } from "../api.js";
import { store } from "../store.js";
import { mealRow, bindCards } from "../components.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";
import { requireShopAuth } from "../authGuard.js";

export async function renderRestaurant(root, id) {
  if (!requireShopAuth()) return;
  const restaurants = await api.restaurants();
  if (!restaurants.length) {
    root.innerHTML = `<div class="wrap"><div class="empty" style="padding:60px 0">${icon("store")}<p>${t("loadError")}</p><a class="btn btn-primary" href="#/restaurants">${t("restaurants")}</a></div></div>`;
    return;
  }
  const r = restaurants.find(x => String(x.id) === String(id));
  if (!r) {
    location.hash = "#/restaurants";
    return;
  }
  // Real restaurants (UUID ids) load their real, orderable menu from the API so
  // that items added to the cart map to real menu items with real prices.
  const isReal = typeof r.id === "string" && !r.id.startsWith("r");
  let menu = [];
  if (isReal) {
    try { menu = await api.restaurantMeals(r.id, r.name); } catch {}
  }
  if (!menu.length) menu = api.menuFor(isReal ? "r1" : r.id);
  const cats = [...new Set(menu.map(m => m.cat))];
  const fav = store.isFavRest(r.id);

  root.innerHTML = `
  <div class="restaurant-cover" style="height:300px;background:linear-gradient(rgba(10,12,16,.15),rgba(10,12,16,.55)),url('${r.img}') center/cover;position:relative">
    <div class="wrap" style="position:relative;height:100%">
      <a href="#/restaurants" class="hbtn" style="position:absolute;top:18px;background:rgba(255,255,255,.92);color:#1a1c1f">${icon("chevL")}</a>
    </div>
  </div>
  <div class="wrap">
    <div class="card card-pad" style="margin-top:-70px;position:relative;z-index:1">
      <div class="row between wrapf" style="gap:16px">
        <div>
          <div class="row" style="gap:10px;margin-bottom:6px"><h1 style="font-size:28px;font-weight:800;letter-spacing:-.6px">${r.name}</h1>${r.promo ? `<span class="badge ${r.promo.includes("OFF") ? "badge-red" : "badge-green"}">${r.promo}</span>` : ""}</div>
          <p class="muted" style="margin-bottom:10px">${r.bio || (r.cuisines || []).join(" · ")}</p>
          <div class="row wrapf" style="gap:16px">
            <span class="rating">${icon("star")} ${Number(r.rating).toFixed(1)} <span class="muted" style="font-weight:500">${t("reviewsCount", { n: r.reviews || 0 })}</span></span>
            <span class="tag">${icon("clock")} ${r.eta}</span>
            <span class="tag">${icon("bike")} ${r.fee ? t("deliveryFee", { fee: money(r.fee) }) : t("freeDelivery")}</span>
            <span class="tag">${icon("pin")} ${r.distance}</span>
            <span class="badge badge-green">${icon("check")} ${t("openNow")}</span>
          </div>
        </div>
        <div class="row" style="gap:10px">
          <button class="hbtn" id="favRest" style="background:var(--surface-2)">${icon("heart")}</button>
          <a class="btn btn-outline" href="#/reserve">${icon("calendar")} ${t("reserveTable")}</a>
        </div>
      </div>
    </div>

    <div class="section" style="padding-top:26px">
      <div class="cat-scroll" id="menuTabs" style="position:sticky;top:80px;z-index:5;background:var(--bg-2);padding-top:6px">
        ${cats.map((c, i) => `<button class="cat-pill ${i === 0 ? "active" : ""}" data-tab="${c}">${c}</button>`).join("")}
      </div>
      <div id="menuList" style="margin-top:10px">
        ${cats.map(c => `<div class="menu-cat" data-cat="${c}" style="scroll-margin-top:140px">
          <h2 style="font-size:22px;font-weight:800;letter-spacing:-.4px;margin:24px 0 4px">${c}</h2>
          ${menu.filter(m => m.cat === c).map(mealRow).join("")}
        </div>`).join("")}
      </div>
    </div>
  </div>
  ${footer()}`;

  if (fav) $("#favRest").classList.add("on"), $("#favRest").querySelector("svg").style.fill = "var(--red-500)";
  $("#favRest").style.color = fav ? "var(--red-500)" : "";
  $("#favRest").addEventListener("click", () => {
    store.toggleFavRest(r.id);
    const on = store.isFavRest(r.id);
    $("#favRest").style.color = on ? "var(--red-500)" : "";
    $("#favRest").querySelector("svg").style.fill = on ? "var(--red-500)" : "none";
    toast(on ? t("savedRestaurant") : t("removed"), "heart");
  });

  bindCards($("#menuList"), menu);
  $$("#menuTabs .cat-pill").forEach(b => b.addEventListener("click", () => {
    $$("#menuTabs .cat-pill").forEach(x => x.classList.remove("active")); b.classList.add("active");
    $(`.menu-cat[data-cat="${b.dataset.tab}"]`)?.scrollIntoView({ behavior: "smooth" });
  }));
}
