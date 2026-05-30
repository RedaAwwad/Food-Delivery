import { icon } from "./icons.js";
import { $, $$, money, avatarEl, toast } from "./ui.js";
import { store, onChange } from "./store.js";
import { api } from "./api.js";
import { t, LANG_OPTIONS, setLanguage, initLanguage } from "./i18n.js";

import { renderHome } from "./pages/home.js";
import { renderRestaurants } from "./pages/restaurants.js";
import { renderRestaurant } from "./pages/restaurant.js";
import { renderMenu } from "./pages/menu.js";
import { renderCart } from "./pages/cart.js";
import { renderCheckout } from "./pages/checkout.js";
import { renderConfirm } from "./pages/confirm.js";
import { renderTrack } from "./pages/track.js";
import { renderCheckin } from "./pages/checkin.js";
import { renderReserve } from "./pages/reserve.js";
import { renderProfile } from "./pages/profile.js";
import { renderOrders } from "./pages/orders.js";
import { renderFavorites } from "./pages/favorites.js";
import { openCartDrawer } from "./pages/cartDrawer.js";
import { goToShopAuth, isShopLoggedIn, applyPostLoginRedirect } from "./authGuard.js";
import { parseHashQuery, navigateSearch } from "./searchUtils.js";
import { isTrackableStatus, trackIdForOrder } from "./orderTracking.js";

const ROUTES = {
  "": renderHome,
  "restaurants": renderRestaurants,
  "restaurant": renderRestaurant,
  "menu": renderMenu,
  "cart": renderCart,
  "checkout": renderCheckout,
  "confirm": renderConfirm,
  "track": renderTrack,
  "checkin": renderCheckin,
  "reserve": renderReserve,
  "profile": renderProfile,
  "orders": renderOrders,
  "favorites": renderFavorites,
};

function applyTheme() { document.documentElement.setAttribute("data-theme", store.theme); }
export function toggleTheme() { store.theme = store.theme === "dark" ? "light" : "dark"; store.save(); applyTheme(); $("#themeIcon").innerHTML = icon(store.theme === "dark" ? "sun" : "moon"); }

function header() {
  return `<header class="header"><div class="wrap header__inner">
    <a class="logo" href="/landing" title="Platform home"><span class="mark">${icon("bike")}</span>FOOD<span>DELIVERY</span></a>
    <button class="header__loc" id="locBtn">${icon("pin")}<span>${t("location")}</span>${icon("chevR")}</button>
    <form class="header__search" id="searchForm">
      ${icon("search")}<input id="globalSearch" placeholder="${t("searchPlaceholder")}">
    </form>
    <div class="header__actions">
      <button class="hbtn" id="themeBtn" title="${t("theme")}"><span id="themeIcon">${icon(store.theme === "dark" ? "sun" : "moon")}</span></button>
      <button class="hbtn" id="langBtn" title="${t("language")}">${icon("globe")}</button>
      <a class="hbtn" href="#/favorites" title="${t("favorites")}">${icon("heart")}<span class="count" id="favCount" style="display:none"></span></a>
      <a class="hbtn" href="#/orders" title="${t("orders")}">${icon("receipt")}</a>
      <a class="hbtn track-link" id="trackLink" href="#/track" title="${t("track")}" style="display:none">${icon("truck")}<span class="track-link__lbl">${t("track")}</span></a>
      <button class="hbtn" id="notifBtn" title="${t("notifications")}">${icon("bell")}<span class="count" style="background:var(--green-500)">3</span></button>
      <button class="hbtn" id="cartBtn" title="${t("cart")}">${icon("cart")}<span class="count" id="cartCount" style="display:none"></span></button>
      <button class="header__cta" id="userBtn">${icon("user")}<span id="userLabel">${t("signIn")}</span></button>
    </div>
  </div></header>`;
}

function bottomNav() {
  const items = [["", "home", "navHome"], ["restaurants", "search", "navExplore"], ["orders", "receipt", "navOrders"], ["favorites", "heart", "navSaved"], ["profile", "user", "navProfile"]];
  return `<nav class="bottom-nav"><div class="bottom-nav__inner">
    ${items.map(([r, ic, key]) => `<a class="bnav" data-route="${r}" href="#/${r}">${icon(ic)}<span>${t(key)}</span></a>`).join("")}
  </div></nav>`;
}

function shell() {
  return `${header()}<main id="view"></main>${bottomNav()}
    <button class="fab-cart" id="fabCart" style="display:none">${icon("cart")}<span id="fabText">${t("viewCart")}</span><span class="ct" id="fabCount">0</span></button>`;
}

function refreshBadges() {
  const c = store.cartCount();
  const cc = $("#cartCount"), fc = $("#fabCount"), fab = $("#fabCart"), ft = $("#fabText");
  if (cc) { cc.textContent = c; cc.style.display = c ? "grid" : "none"; }
  const fv = $("#favCount"); const fcount = store.favMeals.length + store.favRest.length;
  if (fv) { fv.textContent = fcount; fv.style.display = fcount ? "grid" : "none"; }
  if (fab) {
    fab.style.display = c ? "flex" : "none";
    if (fc) fc.textContent = c;
    if (ft) ft.textContent = `${money(store.cartSubtotal())} · ${t("viewCart")}`;
  }
  $$(".bnav .ct").forEach(e => e.remove());

  const trackLink = $("#trackLink");
  const active = store.orders.find(o => isTrackableStatus(o.status));
  if (trackLink) {
    if (active) {
      trackLink.style.display = "inline-flex";
      trackLink.href = `#/track/${trackIdForOrder(active)}`;
    } else {
      trackLink.style.display = "none";
    }
  }
}

function syncGlobalSearch() {
  const inp = $("#globalSearch");
  if (!inp || document.activeElement === inp) return;
  const q = parseHashQuery().get("q") || "";
  inp.value = q;
  inp.placeholder = t("searchPlaceholder");
}

function setActiveNav(base) {
  $$(".bnav").forEach(a => a.classList.toggle("active", a.dataset.route === base));
}

let mounted = false;

const AUTH_ROUTES = new Set(["cart", "checkout", "orders", "profile", "favorites"]);

async function route() {
  applyTheme();
  if (!mounted) { document.getElementById("app").innerHTML = shell(); bindShell(); mounted = true; }
  const hash = location.hash.replace(/^#\//, "");
  const [base, param] = hash.split("/");
  if (base === "login" || base === "register") {
    goToShopAuth(base === "register" ? "register" : "login");
    return;
  }
  if (AUTH_ROUTES.has(base) && !isShopLoggedIn()) {
    goToShopAuth("login");
    return;
  }
  const fn = ROUTES[base] ?? renderHome;
  setActiveNav(base);
  const view = $("#view");
  view.innerHTML = "";
  const el = document.createElement("div");
  el.className = "page";
  view.appendChild(el);
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  try { await fn(el, param, base); }
  catch (e) { console.error(e); el.innerHTML = `<div class="wrap"><div class="empty">${icon("x")}<p>${t("loadError")}</p></div></div>`; }
  syncGlobalSearch();
  refreshBadges();
}

function bindShell() {
  $("#themeBtn").addEventListener("click", toggleTheme);
  $("#cartBtn").addEventListener("click", () => {
    if (!isShopLoggedIn()) { goToShopAuth("login"); return; }
    openCartDrawer();
  });
  $("#fabCart").addEventListener("click", () => {
    if (!isShopLoggedIn()) { goToShopAuth("login"); return; }
    openCartDrawer();
  });
  $("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); navigateSearch($("#globalSearch").value.trim()); });
  $("#globalSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); navigateSearch(e.target.value.trim()); }
  });
  $("#userBtn").addEventListener("click", openUserMenu);
  $("#langBtn").addEventListener("click", openLang);
  $("#locBtn").addEventListener("click", () => toast(t("locationDemo")));
  $("#notifBtn").addEventListener("click", openNotifs);
  updateUserLabel();
  onChange(refreshBadges);
}

function updateUserLabel() {
  const u = api.user;
  const lbl = $("#userLabel");
  if (lbl) lbl.textContent = u ? (u.userName?.split(" ")[0] || t("account")) : t("signIn");
}

function popover(html, anchor, w = 320) {
  $$(".pop").forEach(p => p.remove());
  const pop = document.createElement("div");
  pop.className = "pop"; pop.style.width = w + "px";
  pop.innerHTML = html;
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect();
  const rtl = document.documentElement.dir === "rtl";
  pop.style.top = r.bottom + 10 + "px";
  if (rtl) {
    pop.style.left = Math.max(12, r.left) + "px";
    pop.style.right = "auto";
  } else {
    pop.style.right = Math.max(12, window.innerWidth - r.right) + "px";
  }
  setTimeout(() => document.addEventListener("click", function h(e){ if(!pop.contains(e.target) && !anchor.contains(e.target)){ pop.remove(); document.removeEventListener("click", h);} }), 0);
  return pop;
}

function openUserMenu(e) {
  const u = api.user;
  if (!u) { goToShopAuth("login"); return; }
  const pop = popover(`
    <div style="padding:16px;border-bottom:1px solid var(--border);display:flex;gap:12px;align-items:center">
      ${avatarEl(u.avatar, u.userName || "User", "avatar", 44)}
      <div><div style="font-weight:800">${u.userName || "User"}</div><div class="muted" style="font-size:12.5px">${u.userEmail || ""}</div></div>
    </div>
    <a class="it" href="#/profile">${icon("user")} ${t("myProfile")}</a>
    <a class="it" href="#/favorites">${icon("heart")} ${t("favorites")}</a>
    <a class="it" href="#/reserve">${icon("calendar")} ${t("reservations")}</a>
    <div style="border-top:1px solid var(--border)"></div>
    <button class="it" id="signOut" style="color:var(--red-500);width:100%">${icon("logout")} ${t("signOut")}</button>
  `, e.currentTarget);
  $("#signOut", pop)?.addEventListener("click", () => { api.logout(); updateUserLabel(); pop.remove(); toast(t("signedOut")); location.hash = "#/"; });
}

function openLang(e) {
  const pop = popover(
    LANG_OPTIONS.map(([c, n, f]) => `<button class="it langp" data-l="${c}">${f} ${n} ${c === store.lang ? "✓" : ""}</button>`).join(""),
    e.currentTarget,
    220,
  );
  $$(".langp", pop).forEach(b => b.addEventListener("click", () => {
    setLanguage(b.dataset.l);
    pop.remove();
    toast(t("languageSet"));
    mounted = false;
    route();
  }));
}

function openNotifs(e) {
  const items = [
    ["truck", t("orderOnWay"), t("driverNear")],
    ["tag", t("promoOffer"), t("limitedOffer")],
    ["star", t("rateOrder"), t("rateSub")],
  ];
  popover(`<div style="padding:14px 16px;font-weight:800;border-bottom:1px solid var(--border)">${t("notifications")}</div>
    ${items.map(([ic, title, sub]) => `<div class="it" style="align-items:flex-start"><span style="color:var(--brand-500)">${icon(ic)}</span><div><div style="color:var(--text);font-weight:700;font-size:13.5px">${title}</div><div class="muted" style="font-size:12px;font-weight:400">${sub}</div></div></div>`).join("")}`, e.currentTarget);
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  applyPostLoginRedirect();
  route();
});
window.addEventListener("shop:auth", updateUserLabel);
window.addEventListener("shop:lang", () => { mounted = false; });
