import { icon } from "../icons.js";
import { $, $$ } from "../ui.js";
import { api } from "../api.js";
import { restaurantCard, mealCard, bindCards } from "../components.js";
import { footer } from "./home.js";
import { parseHashQuery, filterRestaurants, filterMeals } from "../searchUtils.js";
import { t } from "../i18n.js";

let all = [], meals = [], cats = [];
let state = { q: "", cat: "", sort: "rating", free: false, fast: false, rate: "Any" };

export async function renderRestaurants(root) {
  const params = parseHashQuery();
  state.q = params.get("q") || "";
  const allLabel = t("catAll");
  state.cat = params.get("cat") || allLabel;

  [all, meals, cats] = await Promise.all([api.restaurants(), api.meals(), api.categories()]);
  const catNames = [allLabel, ...cats.map(c => c.name)];

  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("restaurants")}</span></div>
    <div class="section__head" style="margin-top:6px">
      <div>
        <h2>${state.q ? `${t("resultsFor")} “${state.q}”` : t("allRestaurants")}</h2>
        <p id="resCount"></p>
      </div>
      <div class="row">
        <form class="header__search" id="pageSearch" style="max-width:320px;height:42px">
          ${icon("search")}<input id="pageSearchInput" placeholder="${t("searchPlaceholder")}" value="${state.q.replace(/"/g, "&quot;")}">
        </form>
        <select class="select" id="sortSel" style="width:auto;height:42px">
          <option value="rating">${t("topRated")}</option>
          <option value="eta">${t("fastest")}</option>
          <option value="distance">${t("nearest")}</option>
        </select>
      </div>
    </div>

    <div class="with-side">
      <aside class="side-card card card-pad">
        <h4 style="font-weight:800;margin-bottom:14px">${t("categories")}</h4>
        <div id="catList" style="display:flex;flex-direction:column;gap:4px">
          ${catNames.map(c => `<button class="it-cat" data-cat="${c}" style="text-align:left;padding:9px 12px;border-radius:10px;font-weight:600;font-size:14px;color:var(--text-2)">${c}</button>`).join("")}
        </div>
        <div class="divider"></div>
        <h4 style="font-weight:800;margin-bottom:12px">${t("filters")}</h4>
        <label class="row between" style="cursor:pointer;margin-bottom:12px"><span class="row" style="gap:8px">${icon("bike")} ${t("freeDelivery")}</span><input type="checkbox" id="fFree" style="width:18px;height:18px;accent-color:var(--brand-500)"></label>
        <label class="row between" style="cursor:pointer;margin-bottom:14px"><span class="row" style="gap:8px">${icon("clock")} ${t("under30")}</span><input type="checkbox" id="fFast" style="width:18px;height:18px;accent-color:var(--brand-500)"></label>
        <div class="divider"></div>
        <h4 style="font-weight:800;margin-bottom:12px">${t("minRating")}</h4>
        <div class="row" id="rateChips" style="gap:6px;flex-wrap:wrap">
          ${[t("catAny"), "4.0+", "4.5+", "4.8+"].map((r, i) => `<button class="cat-pill ${i === 0 ? "active" : ""}" data-rate="${r}">${r}</button>`).join("")}
        </div>
      </aside>

      <div>
        <div id="dishSection" style="display:none;margin-bottom:28px">
          <h3 style="font-weight:800;margin-bottom:14px">${icon("utensils")} ${t("dishes")}</h3>
          <div class="cards-4" id="dishGrid"></div>
        </div>
        <h3 id="restTitle" style="font-weight:800;margin-bottom:14px;display:none">Restaurants</h3>
        <div class="cards-3" id="resGrid"></div>
      </div>
    </div>
  </div>
  ${footer()}`;

  $("#pageSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#pageSearchInput").value.trim();
    location.hash = `#/restaurants${q ? "?q=" + encodeURIComponent(q) : ""}`;
  });

  $("#sortSel").addEventListener("change", e => { state.sort = e.target.value; paint(); });
  $("#fFree").addEventListener("change", e => { state.free = e.target.checked; paint(); });
  $("#fFast").addEventListener("change", e => { state.fast = e.target.checked; paint(); });
  $$("#catList .it-cat").forEach(b => b.addEventListener("click", () => { state.cat = b.dataset.cat; markCat(); paint(); }));
  $$("#rateChips .cat-pill").forEach(b => b.addEventListener("click", () => {
    $$("#rateChips .cat-pill").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    state.rate = b.dataset.rate;
    paint();
  }));
  markCat();
  paint();
}

function markCat() {
  $$("#catList .it-cat").forEach(b => {
    const on = b.dataset.cat === state.cat;
    b.style.background = on ? "var(--brand-50)" : "transparent";
    b.style.color = on ? "var(--brand-600)" : "var(--text-2)";
  });
}

function paint() {
  let list = filterRestaurants(all, state.q, state.cat);
  if (state.free) list = list.filter(r => !r.fee || r.fee <= 0);
  if (state.fast) list = list.filter(r => parseInt(r.eta) < 30);
  if (state.rate && state.rate !== t("catAny")) {
    const min = parseFloat(state.rate);
    list = list.filter(r => r.rating >= min);
  }
  if (state.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (state.sort === "eta") list.sort((a, b) => parseInt(a.eta) - parseInt(b.eta));
  if (state.sort === "distance") list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  const dishMatches = filterMeals(meals, state.q);
  const dishSec = $("#dishSection");
  const dishGrid = $("#dishGrid");
  const restTitle = $("#restTitle");

  if (state.q && dishMatches.length) {
    dishSec.style.display = "block";
    restTitle.style.display = "block";
    dishGrid.innerHTML = dishMatches.slice(0, 12).map(m => mealCard(m)).join("");
    bindCards(dishGrid, dishMatches, (restId) => { location.hash = `#/restaurant/${restId}`; });
  } else {
    dishSec.style.display = "none";
    if (restTitle) restTitle.textContent = t("restaurants");
    restTitle.style.display = state.q ? "block" : "none";
  }

  const grid = $("#resGrid");
  grid.innerHTML = list.length
    ? list.map(restaurantCard).join("")
    : `<div class="empty" style="grid-column:1/-1">${icon("search")}<p>${t("noRestaurants")}</p>${state.q ? `<a class="btn btn-primary btn-sm" href="#/restaurants" style="margin-top:12px">${t("clearSearch")}</a>` : ""}</div>`;
  const parts = [];
  if (state.q && dishMatches.length) parts.push(t("countDishes", { n: dishMatches.length }));
  parts.push(t("countRestaurants", { n: list.length }));
  $("#resCount").textContent = parts.join(" · ");
  bindCards(grid, meals, (id) => { location.hash = `#/restaurant/${id}`; });
}
