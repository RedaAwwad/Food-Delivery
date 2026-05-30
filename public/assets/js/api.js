// API layer — talks to the Food-Delivery backend (/api/v1).
import { MOCK } from "./mock.js";

const BASE = "/api/v1";
let TOKEN = localStorage.getItem("fd_token") || "";

function isDemoSession() {
  return !TOKEN || TOKEN === "demo-token";
}

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
    throw Object.assign(new Error(data?.error?.message || data?.message || "Request failed"), {
      status: res.status,
      data,
    });
  }
  return data;
}

export const api = {
  get token() { return TOKEN; },
  isDemo: isDemoSession,
  setToken(t) {
    TOKEN = t || "";
    t ? localStorage.setItem("fd_token", t) : localStorage.removeItem("fd_token");
    localStorage.removeItem("fd_demo");
  },

  async login(email, password) {
    const r = await req("POST", "/auth/login", { email, password });
    const tok = r?.data?.accessToken;
    if (!tok) throw new Error("No access token returned");
    this.setToken(tok);
    return { ok: true, demo: false, user: r?.data?.user };
  },

  async register(payload) {
    await req("POST", "/auth/signup", {
      name: payload.userName || payload.name,
      email: payload.userEmail || payload.email,
      password: payload.userPassword || payload.password,
      passwordConfirmation: payload.userPassword || payload.password,
      phone: payload.customerPhone || payload.phone || "",
    });
    return { ok: true, demo: false };
  },

  async forgot(email) {
    await req("POST", "/auth/forgot-password", { email });
    return { ok: true, demo: false };
  },

  async me() {
    if (isDemoSession()) return { data: null, live: false };
    return safeObject(() => req("GET", "/auth/me"), null);
  },

  logout() { this.setToken(""); },

  async restaurants(params = "page=1&perPage=24") {
    return safeList(() => req("GET", `/restaurants?${params}`), MOCK.branches);
  },

  async dashboardBranches(params = "page=1&perPage=24") {
    if (isDemoSession()) return { data: MOCK.branches, live: false, meta: null };
    try {
      const r = await req("GET", `/dashboard/branches?${params}`);
      const arr = r?.data ?? [];
      return { data: Array.isArray(arr) ? arr : [], live: true, meta: r?.meta ?? null };
    } catch (e) {
      console.warn("[api] branches:", e.message);
      return { data: [], live: false, error: e.message };
    }
  },

  async createBranch(body) {
    const r = await req("POST", "/dashboard/branches", body);
    return r?.data ?? r;
  },

  async updateBranch(body) {
    const r = await req("PUT", "/dashboard/branches", body);
    return r?.data ?? r;
  },

  async toggleBranch(restaurantId) {
    const r = await req("PATCH", `/dashboard/branches/${restaurantId}/toggle`);
    return r?.data ?? r;
  },

  async deleteBranch(restaurantId) {
    await req("DELETE", "/dashboard/branches", { restaurantId });
  },

  async menuForRestaurant(restaurantId) {
    if (isDemoSession()) return { data: { menu: null, categories: [], items: MOCK.menuItems }, live: false };
    try {
      const r = await req("GET", `/dashboard/menu/${restaurantId}`);
      return {
        data: r?.data ?? { menu: null, categories: [], items: [] },
        live: true,
      };
    } catch (e) {
      console.warn("[api] menu:", e.message);
      return { data: { menu: null, categories: [], items: [] }, live: false, error: e.message };
    }
  },

  async ensureMenu(restaurantId, menuDesc = "Main menu") {
    const r = await req("POST", `/dashboard/menu/${restaurantId}/ensure`, { menuDesc });
    return r?.data ?? r;
  },

  async createMenuCategory(restaurantId, body) {
    const r = await req("POST", `/dashboard/menu/${restaurantId}/categories`, body);
    return r?.data ?? r;
  },

  async deleteMenuCategory(menuCategoryId) {
    await req("DELETE", "/dashboard/menu/categories", { menuCategoryId });
  },

  async createMenuItem(body) {
    const r = await req("POST", "/menu-items", body);
    return r?.data ?? r;
  },

  async updateMenuItem(body) {
    const r = await req("PUT", "/menu-items", body);
    return r?.data ?? r;
  },

  async deleteMenuItem(menuItemId) {
    await req("DELETE", "/menu-items", { menuItemId });
  },

  async adminOrders() {
    return safeList(() => req("GET", "/dashboard/orders"), MOCK.orders);
  },

  async dashboardStats() {
    return safeObject(() => req("GET", "/dashboard/stats"), buildMockStats());
  },

  async updateKitchenStatus(orderId, displayStatus) {
    const r = await req("PATCH", `/dashboard/orders/${orderId}/kitchen-status`, { displayStatus });
    return r?.data ?? r;
  },

  async updateOrderStatus(orderId, newOrderStatus) {
    const r = await req("PATCH", `/orders/${orderId}/status`, { orderId, newOrderStatus });
    return r?.data ?? r;
  },

  raw: req,
};

function buildMockStats() {
  return {
    stats: MOCK.stats,
    orderStatusReport: {
      pending: 8, preparing: 5, ready: 4, delivering: 3, completed: 38, canceled: 2, total: 60,
    },
    revenueChart: MOCK.revenueChart,
    popularMeals: MOCK.popularMeals,
    notifications: MOCK.notifications,
  };
}

async function safeList(fn, fallback) {
  if (isDemoSession()) return { data: fallback, live: false };
  try {
    const r = await fn();
    const arr = r?.data ?? r;
    if (Array.isArray(arr)) return { data: arr, live: true };
    return { data: [], live: true };
  } catch (e) {
    console.warn("[api] list:", e.message);
    return { data: [], live: false, error: e.message };
  }
}

async function safeObject(fn, fallback) {
  if (isDemoSession()) return { data: fallback, live: false };
  try {
    const r = await fn();
    const obj = r?.data ?? r;
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return { data: obj, live: true };
    }
    return { data: fallback, live: false, error: "Invalid response" };
  } catch (e) {
    console.warn("[api] object:", e.message);
    return { data: fallback, live: false, error: e.message };
  }
}
