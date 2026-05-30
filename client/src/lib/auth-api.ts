import { getApiBase } from "@/lib/env";

const API = getApiBase();

export type AuthApp = "dashboard" | "shop";

function tokenKey(app: AuthApp) {
  return app === "shop" ? "shop_token" : "fd_token";
}

function userKey(app: AuthApp) {
  return app === "shop" ? "shop_user" : "fd_user";
}

export function getAuthApp(search: URLSearchParams): AuthApp {
  return search.get("app") === "shop" ? "shop" : "dashboard";
}

export async function login(
  email: string,
  password: string,
  app: AuthApp
): Promise<{ ok: boolean; user?: unknown }> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || "Login failed");
  }
  const tok = data?.data?.accessToken;
  if (!tok) throw new Error("No access token returned");
  localStorage.setItem(tokenKey(app), tok);
  if (data?.data?.user) {
    localStorage.setItem(userKey(app), JSON.stringify(data.data.user));
  }
  return { ok: true, user: data?.data?.user };
}

export async function register(
  payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  },
  app: AuthApp
) {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      passwordConfirmation: payload.password,
      phone: payload.phone || "",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || "Registration failed");
  }
  return login(payload.email, payload.password, app);
}

export function redirectAfterAuth(app: AuthApp) {
  if (app === "shop") {
    const back = sessionStorage.getItem("shop_return") || "#/";
    sessionStorage.removeItem("shop_return");
    window.location.href = back.startsWith("#") ? `/shop${back}` : "/shop";
    return;
  }
  window.location.href = "/dashboard";
}
