// Customer storefront API — real database first, demo catalog as fallback only.
import { RESTAURANTS, MEALS, CATEGORIES, menuFor } from "./data.js";

const BASE = "/api/v1";
let TOKEN = localStorage.getItem("shop_token") || "";

function headers(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (TOKEN) h["Authorization"] = `Bearer ${TOKEN}`;
  return h;
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(!!body),
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data?.message || data?.error?.message || "Request failed"), {
      status: res.status,
      data,
    });
  }
  return data;
}

export const api = {
  get token() { return TOKEN; },
  setToken(t) {
    TOKEN = t || "";
    t ? localStorage.setItem("shop_token", t) : localStorage.removeItem("shop_token");
  },
  get user() {
    try { return JSON.parse(localStorage.getItem("shop_user") || "null"); } catch { return null; }
  },
  setUser(u) {
    u ? localStorage.setItem("shop_user", JSON.stringify(u)) : localStorage.removeItem("shop_user");
  },

  async login(email, password) {
    const r = await req("POST", "/auth/login", { email, password });
    const tok = r?.data?.accessToken;
    const user = r?.data?.user;
    if (!tok) throw new Error("Login failed");
    this.setToken(tok);
    if (user) this.setUser(user);
    _realMealsCache = null;
    return { ok: true, demo: false, user };
  },

  async register(p) {
    await req("POST", "/auth/signup", {
      name: p.name,
      email: p.email,
      password: p.password,
      passwordConfirmation: p.password,
      phone: p.phone || "",
    });
    return { ok: true, demo: false };
  },

  logout() {
    this.setToken("");
    this.setUser(null);
    _realMealsCache = null;
  },

  refreshSession() {
    TOKEN = localStorage.getItem("shop_token") || "";
  },

  isLoggedIn() {
    this.refreshSession();
    return !!TOKEN && TOKEN !== "demo-token";
  },

  async restaurants() {
    try {
      const r = await req("GET", "/restaurants?page=1&perPage=48");
      const arr = r?.data ?? r;
      if (Array.isArray(arr) && arr.length) return arr.map(mapRestaurant);
    } catch (e) {
      console.warn("[shop] restaurants:", e.message);
    }
    return RESTAURANTS;
  },

  async categories() {
    return CATEGORIES;
  },

  async meals() {
    try {
      const meals = await buildRealMeals();
      if (meals.length) return meals;
    } catch (e) {
      console.warn("[shop] meals:", e.message);
    }
    return MEALS;
  },

  async restaurantMeals(restaurantId, restaurantName) {
    const items = await this.orderableItems(restaurantId);
    return items.map((it) => mapOrderable(it, restaurantId, restaurantName));
  },

  menuFor,
  raw: req,

  async publicConfig() {
    try {
      const r = await req("GET", "/public/config");
      return r?.data ?? {};
    } catch {
      return { stripePublishableKey: "" };
    }
  },

  async myOrders() {
    const r = await req("GET", "/orders");
    const arr = r?.data ?? r;
    return Array.isArray(arr) ? arr : [];
  },

  async getOrder(orderId) {
    const r = await req("GET", `/orders/${orderId}`);
    return r?.data ?? r;
  },

  async getOrderTracking(orderId) {
    const r = await req("GET", `/orders/${orderId}/tracking`);
    return r?.data ?? r;
  },

  async orderableItems(restaurantId) {
    const r = await req("GET", `/menu-items/restaurant/${restaurantId}`);
    const arr = r?.data ?? r;
    return Array.isArray(arr) ? arr : [];
  },

  async placeRealOrder(cart, { paymentProvider = "CASH_ON_DELIVERY" } = {}) {
    if (!this.isLoggedIn()) throw Object.assign(new Error("login-required"), { code: "login-required" });

    const real = (cart || []).filter((i) => i.restaurantId && i.mealId);
    if (!real.length) throw Object.assign(new Error("no-items"), { code: "no-items" });
    const restaurantId = real[0].restaurantId;
    const lines = real.filter((i) => i.restaurantId === restaurantId);

    try { await req("POST", "/cart/add-cart-event", { eventType: "CLEAR_CART" }); } catch {}

    for (const line of lines) {
      const stock = Math.max(1, Number(line.stockQuantity) || 9999);
      const qty = Math.min(Math.max(1, Number(line.qty) || 1), stock);
      await req("POST", "/cart/add-cart-event", {
        eventType: "ADD_TO_CART",
        menuItemId: line.mealId,
        quantity: qty,
      });
    }

    const res = await req("POST", "/orders/check-out", { paymentProvider });
    const payload = res?.data ?? {};
    const order = payload.order ?? payload;
    const clientSecret = payload.clientSecret ?? null;

    const byId = new Map(lines.map((l) => [l.mealId, l]));
    const items = (order?.orderItems || []).map((oi) => {
      const m = byId.get(oi.menuItemId);
      return { name: m?.name || "Menu item", qty: oi.quantity, price: oi.price, img: m?.img || "" };
    });
    const total = order?.totalAmount ?? items.reduce((s, i) => s + i.price * i.qty, 0);

    return {
      orderId: order?.orderId || null,
      totalAmount: total,
      items,
      restaurant: lines[0].restaurantName || "Your order",
      clientSecret,
      orderStatus: order?.orderStatus || null,
    };
  },

  async confirmStripePayment(orderId) {
    const res = await req("POST", "/orders/confirm-payment", { orderId });
    return res?.data ?? res;
  },
};

let _realMealsCache = null;

function mapOrderable(it, restaurantId, restaurantName) {
  return {
    id: it.menuItemId,
    menuItemId: it.menuItemId,
    restaurantId,
    restaurantName: restaurantName || "Restaurant",
    name: it.menuItemName,
    desc: it.menuItemDesc || "",
    price: Number(it.price) || 0,
    img: it.menuItemImageUrl || MEALS[0]?.img,
    cat: "Menu",
    rating: 4.6,
    sold: 0,
    popular: false,
    veg: false,
    stockQuantity: Number(it.stockQuantity) || 0,
  };
}

async function buildRealMeals() {
  if (_realMealsCache?.length) return _realMealsCache;
  const r = await req("GET", "/restaurants?page=1&perPage=30");
  const list = (r?.data ?? r) || [];
  const meals = [];
  for (const rest of list) {
    const id = rest.restaurantId || rest.id;
    if (!id) continue;
    try {
      const items = await api.orderableItems(id);
      items.forEach((it) =>
        meals.push(mapOrderable(it, id, rest.restaurantName || rest.name))
      );
    } catch {}
    if (meals.length >= 48) break;
  }
  if (meals.length) {
    meals.slice(0, 8).forEach((m) => (m.popular = true));
    _realMealsCache = meals;
  }
  return meals;
}

function mapRestaurant(r) {
  return {
    id: r.restaurantId || r.id,
    name: r.restaurantName || r.name,
    img: r.restaurantLogo || RESTAURANTS[0].img,
    cuisines: ["Restaurant"],
    rating: r.averageRating || 4.6,
    reviews: r.ratingCount || 0,
    eta: "25-35 min",
    fee: 0,
    distance: "1.5 km",
    price: "$$",
    promo: r.isAvailable === false ? "Closed" : "",
    featured: (r.averageRating || 0) >= 4.7,
    bio: r.restaurantBio,
  };
}
