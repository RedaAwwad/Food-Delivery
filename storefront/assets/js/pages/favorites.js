import { icon } from "../icons.js";
import { $, $$ } from "../ui.js";
import { api } from "../api.js";
import { mealCard, restaurantCard, bindCards } from "../components.js";
import { store } from "../store.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";

let tab = "meals";

export async function renderFavorites(root) {
  const [restaurants, meals] = await Promise.all([api.restaurants(), api.meals()]);
  const favMeals = meals.filter(m => store.isFavMeal(m.id));
  const favRest = restaurants.filter(r => store.isFavRest(r.id));

  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("favorites")}</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>${t("favoritesTitle")}</h2><p>${t("favoritesCount", { meals: favMeals.length, rest: favRest.length })}</p></div></div>
    <div class="cat-scroll" style="margin-bottom:14px">
      <button class="cat-pill ${tab === "meals" ? "active" : ""}" data-tab="meals">${icon("utensils")} ${t("favMealsTab")} (${favMeals.length})</button>
      <button class="cat-pill ${tab === "rest" ? "active" : ""}" data-tab="rest">${icon("home")} ${t("favRestTab")} (${favRest.length})</button>
    </div>
    <div id="favBody"></div>
  </div>${footer()}`;

  const paint = () => {
    const body = $("#favBody");
    if (tab === "meals") {
      body.innerHTML = favMeals.length ? `<div class="cards-4">${favMeals.map(m => mealCard(m)).join("")}</div>`
        : empty(t("noFavMeals"), t("noFavMealsSub"));
      bindCards(body, meals);
    } else {
      body.innerHTML = favRest.length ? `<div class="cards-3">${favRest.map(restaurantCard).join("")}</div>`
        : empty(t("noFavRest"), t("noFavRestSub"));
      bindCards(body, []);
    }
  };
  $$("[data-tab]", root).forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; $$("[data-tab]").forEach(x => x.classList.remove("active")); b.classList.add("active"); paint(); }));
  paint();
}

function empty(title, sub) {
  return `<div class="empty">${icon("heart")}<h3 style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px">${title}</h3><p>${sub}</p><a class="btn btn-primary" href="#/restaurants" style="margin-top:16px">${t("exploreRestaurants")}</a></div>`;
}
