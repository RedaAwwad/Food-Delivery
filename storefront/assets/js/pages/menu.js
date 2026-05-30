import { icon } from "../icons.js";
import { $, $$ } from "../ui.js";
import { api } from "../api.js";
import { mealCard, bindCards, sectionHead } from "../components.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";

let meals = [], active = "All";

export async function renderMenu(root) {
  meals = await api.meals();
  const catNames = [t("catAll"), ...new Set(meals.map(m => m.cat))];
  const featured = meals.filter(m => m.popular).slice(0, 4);

  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("menuPage")}</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>${t("discoverDishes")}</h2><p>${t("menuBrowseSub")}</p></div></div>

    ${featured.length ? `<section class="section" style="padding-top:0">
      ${sectionHead(t("featuredMeals"), t("handPicked"))}
      <div class="cards-4" id="featured">${featured.map(m => mealCard(m)).join("")}</div>
    </section>` : ""}

    <div class="cat-scroll" id="catTabs" style="position:sticky;top:80px;z-index:5;background:var(--bg-2);padding:10px 2px">
      ${catNames.map((c, i) => `<button class="cat-pill ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`).join("")}
    </div>
    <div class="cards-4" id="menuGrid" style="margin-top:8px"></div>
    <div style="height:30px"></div>
  </div>
  ${footer()}`;

  if (featured.length) bindCards($("#featured"), meals);
  $$("#catTabs .cat-pill").forEach(b => b.addEventListener("click", () => { $$("#catTabs .cat-pill").forEach(x => x.classList.remove("active")); b.classList.add("active"); active = b.dataset.cat; paint(); }));
  paint();
}

function paint() {
  const allLabel = t("catAll");
  const list = active === allLabel ? meals : meals.filter(m => m.cat === active);
  const grid = $("#menuGrid");
  grid.innerHTML = list.length ? list.map(m => mealCard(m)).join("") : `<div class="empty" style="grid-column:1/-1">${icon("utensils")}<p>${t("noDishes")}</p></div>`;
  bindCards(grid, meals);
}
