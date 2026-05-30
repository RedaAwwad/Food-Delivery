// Global client state: cart, favorites, addresses, theme, language, orders.
import { round2, cartSubtotal as calcSubtotal } from "./pricing.js";

const LS = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
};

const listeners = new Set();
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(fn => fn()); }

export const store = {
  cart: LS.get("shop_cart", []),
  favMeals: LS.get("shop_fav_meals", []),
  favRest: LS.get("shop_fav_rest", []),
  addresses: LS.get("shop_addresses", [
    { id: "a1", label: "Home", line: "221B Baker Street, Apt 4", city: "London", icon: "home", default: true },
    { id: "a2", label: "Work", line: "55 Innovation Drive, Floor 12", city: "London", icon: "bag", default: false },
  ]),
  cards: LS.get("shop_cards", [
    { id: "c1", brand: "Visa", last4: "4242", exp: "08/27", default: true },
  ]),
  orders: LS.get("shop_orders", []),
  theme: LS.get("shop_theme", "light"),
  lang: LS.get("shop_lang", "en"),

  save() {
    LS.set("shop_cart", this.cart); LS.set("shop_fav_meals", this.favMeals);
    LS.set("shop_fav_rest", this.favRest); LS.set("shop_addresses", this.addresses);
    LS.set("shop_cards", this.cards); LS.set("shop_orders", this.orders);
    LS.set("shop_theme", this.theme); LS.set("shop_lang", this.lang);
    emit();
  },

  // ---- cart ----
  cartCount() { return this.cart.reduce((s, i) => s + (Number(i.qty) || 0), 0); },
  cartSubtotal() { return calcSubtotal(this.cart); },
  // The current restaurant the cart belongs to (real orders are single-restaurant).
  cartRestaurantId() { return this.cart.find(i => i.restaurantId)?.restaurantId || null; },
  addToCart(item) {
    // Enforce a single-restaurant cart so the order maps cleanly to one DB order.
    const current = this.cartRestaurantId();
    if (item.restaurantId && current && item.restaurantId !== current) {
      const ok = window.confirm(
        this.lang === "ar"
          ? "سلتك تحتوي أصنافاً من مطعم آخر. هل تريد بدء سلة جديدة؟"
          : "Your cart has items from another restaurant. Start a new cart with this item?",
      );
      if (!ok) return false;
      this.cart = [];
    }
    const key = item.key || `${item.mealId}|${(item.optionsLabel || "")}`;
    const found = this.cart.find(i => i.key === key);
    if (found) found.qty += item.qty || 1;
    else this.cart.push({ ...item, key, price: round2(item.price), qty: item.qty || 1 });
    this.save();
    return true;
  },
  setQty(key, qty) {
    const it = this.cart.find(i => i.key === key);
    if (!it) return;
    it.qty = qty;
    if (it.qty <= 0) this.cart = this.cart.filter(i => i.key !== key);
    this.save();
  },
  clearCart() { this.cart = []; this.save(); },

  // ---- favorites ----
  isFavMeal(id) { return this.favMeals.includes(id); },
  toggleFavMeal(id) { this.favMeals = this.isFavMeal(id) ? this.favMeals.filter(x => x !== id) : [...this.favMeals, id]; this.save(); },
  isFavRest(id) { return this.favRest.includes(id); },
  toggleFavRest(id) { this.favRest = this.isFavRest(id) ? this.favRest.filter(x => x !== id) : [...this.favRest, id]; this.save(); },

  // ---- orders ----
  placeOrder(o) { const order = { id: "FD-" + Math.floor(100000 + Math.random() * 899999), placedAt: Date.now(), status: "confirmed", ...o }; this.orders.unshift(order); this.save(); return order; },
};
