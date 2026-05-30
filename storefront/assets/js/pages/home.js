import { icon } from "../icons.js";
import { $, $$, money, avatarEl } from "../ui.js";
import { api } from "../api.js";
import { restaurantCard, mealCard, sectionHead, bindCards } from "../components.js";
import { navigateSearch } from "../searchUtils.js";
import { t, getLang, localizedOffers, localizedReviews } from "../i18n.js";
import { requireShopAuth } from "../authGuard.js";

const HERO = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=85&auto=format&fit=crop";

function fmtNum(n) {
  const x = Number(n) || 0;
  return x >= 1000 ? (x / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(x);
}
function topRating(restaurants) {
  if (!restaurants.length) return "4.8";
  const max = Math.max(...restaurants.map((r) => Number(r.rating) || 0));
  return max.toFixed(1);
}

export async function renderHome(root) {
  const [restaurants, meals, cats] = await Promise.all([api.restaurants(), api.meals(), api.categories()]);
  const OFFERS = localizedOffers();
  const REVIEWS = localizedReviews();
  const trending = meals.filter(m => m.popular).concat(meals).slice(0, 8);
  const aiPicks = meals.slice(2, 6);

  const heroTitle = getLang() === "ar"
    ? t("homeTitle")
    : `Crave it? <em>${t("homeTitleEm")}</em> delivered to your door.`;

  root.innerHTML = `
  <div class="wrap">
    <section class="hero">
      <div class="hero__bg" style="background-image:url('${HERO}')"></div>
      <div class="hero__content">
        <span class="badge badge-brand" style="margin-bottom:14px">${icon("bike")} ${t("homeBadge")}</span>
        <h1>${heroTitle}</h1>
        <p>${t("homeSubtitle")}</p>
        <form class="hero__search" id="heroSearch">
          <div class="ig">${icon("search")}<input id="heroInput" placeholder="${t("homeSearchPlaceholder")}"></div>
          <button class="btn btn-primary" type="submit">${t("search")}</button>
        </form>
        <div class="hero__stats">
          <div><strong>${fmtNum(restaurants.length)}+</strong><span>${t("statRestaurants")}</span></div>
          <div><strong>${fmtNum(meals.length)}+</strong><span>${t("statMeals")}</span></div>
          <div><strong>${topRating(restaurants)} ★</strong><span>${t("statRating")}</span></div>
        </div>
      </div>
    </section>

    <section class="section">
      ${sectionHead(t("exploreCategories"), t("cravingToday"), "#/restaurants")}
      <div class="cat-scroll" id="catScroll">
        ${cats.map(c => `<div class="cat-card" data-cat="${c.name}">
          <div class="ic" style="background-image:url('${c.img}')"></div>
          <div class="nm">${c.name}</div><div class="ct">${c.count || ""} ${t("places")}</div>
        </div>`).join("")}
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="promos">
        ${OFFERS.map(o => `<div class="promo-card" style="background:${o.bg}"><span class="em">${o.em}</span><h3>${o.title}</h3><p>${o.sub}</p><button class="btn btn-ghost btn-sm promo-order" style="width:fit-content;background:rgba(255,255,255,.18);color:#fff;border:none">${t("orderNow")}</button></div>`).join("")}
      </div>
    </section>

    <section class="section" style="padding-top:0">
      ${sectionHead(t("popularRestaurants"), t("topRatedNear"), "/landing/restaurants")}
      <div class="cards-4" id="popRest">${restaurants.slice(0, 4).map(restaurantCard).join("")}</div>
    </section>

    <section class="section" style="padding-top:0">
      ${sectionHead(t("trendingMeals"), t("mostOrdered"), "#/menu")}
      <div class="cards-4" id="trendMeals">${trending.map(m => mealCard(m)).join("")}</div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="ai-band">
        <span class="ai-pill">${icon("sparkles")} AI</span>
        <div class="row between wrapf" style="gap:16px;margin-bottom:20px">
          <div><h2 style="font-size:24px;font-weight:800;letter-spacing:-.5px">${t("aiPicks")}</h2>
          <p style="opacity:.8;font-size:14px">${t("aiPicksSub")}</p></div>
          <button class="btn btn-primary" id="aiMore">${icon("sparkles")} ${t("refreshPicks")}</button>
        </div>
        <div class="cards-4" id="aiPicks">${aiPicks.map(m => mealCard(m)).join("")}</div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      ${sectionHead(t("customerReviews"), t("lovedBy"))}
      <div class="cards-3">
        ${REVIEWS.map(r => `<div class="review">
          <div class="row between">${avatarEl(r.avatar, r.name, "avatar", 44)}<span class="rating">${"★".repeat(r.rating)}</span></div>
          <p>"${r.text}"</p>
          <strong>${r.name}</strong>
        </div>`).join("")}
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="card card-pad" style="display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;background:linear-gradient(120deg,var(--surface),var(--surface-2))">
        <div class="row" style="gap:18px"><div style="width:60px;height:60px;border-radius:18px;background:var(--brand-50);color:var(--brand-500);display:grid;place-items:center">${icon("qr")}</div>
        <div><h3 style="font-size:20px;font-weight:800">${t("qrTitle")}</h3><p class="muted">${t("qrSub")}</p></div></div>
        <a class="btn btn-dark" href="#/checkin">${icon("qr")} ${t("tryQr")}</a>
      </div>
    </section>
  </div>
  ${footer()}`;

  bindCards(root, [...meals, ...trending, ...aiPicks]);
  $$(".promo-order", root).forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!requireShopAuth()) return;
      location.hash = "#/restaurants";
    })
  );
  $("#heroSearch").addEventListener("submit", (e) => { e.preventDefault(); navigateSearch($("#heroInput").value.trim()); });
  $$("#catScroll .cat-card").forEach(c => c.addEventListener("click", () => location.hash = `#/restaurants?cat=${encodeURIComponent(c.dataset.cat)}`));
  $("#aiMore").addEventListener("click", () => {
    const shuffled = [...meals].sort(() => Math.random() - 0.5).slice(0, 4);
    $("#aiPicks").innerHTML = shuffled.map(m => mealCard(m)).join("");
    bindCards($("#aiPicks"), shuffled);
  });
}

export function footer() {
  return `<footer class="footer"><div class="wrap">
    <div class="footer__grid">
      <div>
        <a class="logo" href="#/" style="margin-bottom:14px">${icon("bike")} <span style="color:inherit">FOOD</span><span>DELIVERY</span></a>
        <p class="muted" style="font-size:13.5px;max-width:280px">${t("footerTagline")}</p>
      </div>
      <div><h4>${t("footerCompany")}</h4><a href="#/">${t("footerAbout")}</a><a href="#/">${t("footerCareers")}</a><a href="#/">${t("footerBlog")}</a><a href="#/">${t("footerPress")}</a></div>
      <div><h4>${t("footerCustomers")}</h4><a href="#/restaurants">${t("restaurants")}</a><a href="#/reserve">${t("reservations")}</a><a href="#/favorites">${t("favorites")}</a><a href="#/checkin">${t("footerCheckin")}</a></div>
      <div><h4>${t("footerApp")}</h4><a href="#/">📱 App Store</a><a href="#/">🤖 Google Play</a><a href="#/">${t("footerHelp")}</a><a href="#/">${t("footerContact")}</a></div>
    </div>
    <div class="footer__bottom"><span>${t("footerRights")}</span><span class="row" style="gap:18px"><a href="#/">${t("footerPrivacy")}</a><a href="#/">${t("footerTerms")}</a><a href="#/">${t("footerCookies")}</a></span></div>
  </div></footer>`;
}
