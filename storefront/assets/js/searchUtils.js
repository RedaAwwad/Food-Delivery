/** Shared search helpers for restaurants and menu items. */
import { t } from "./i18n.js";

export function parseHashQuery() {
  const h = location.hash;
  const qi = h.indexOf("?");
  return new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : "");
}

export function normalizeQuery(q) {
  return String(q || "").trim().toLowerCase();
}

export function matchesQuery(text, q) {
  if (!q) return true;
  return normalizeQuery(text).includes(q);
}

export function filterRestaurants(list, q, cat) {
  const query = normalizeQuery(q);
  const allCat = t("catAll");
  const activeCat = cat || allCat;
  return (list || []).filter(r => {
    if (activeCat !== allCat && !(r.cuisines || []).some(c => c.toLowerCase().includes(activeCat.toLowerCase())) && !r.name.toLowerCase().includes(activeCat.toLowerCase())) return false;
    if (!query) return true;
    const blob = [r.name, r.bio, (r.cuisines || []).join(" ")].join(" ");
    return matchesQuery(blob, query);
  });
}

export function filterMeals(list, q) {
  const query = normalizeQuery(q);
  if (!query) return [];
  return (list || []).filter(m => {
    const blob = [m.name, m.desc, m.cat, m.restaurantName].join(" ");
    return matchesQuery(blob, query);
  });
}

export function navigateSearch(q) {
  location.hash = `#/restaurants${q ? "?q=" + encodeURIComponent(q) : ""}`;
}
