import { api } from "./api.js";
import { toast } from "./ui.js";
import { t } from "./i18n.js";

/** Re-read token from storage (e.g. after login on /landing/login). */
export function refreshShopSession() {
  api.refreshSession();
}

export function isShopLoggedIn() {
  refreshShopSession();
  return api.isLoggedIn();
}

export function goToShopAuth(mode = "login") {
  const ret = location.hash && location.hash !== "#" ? location.hash : "#/";
  sessionStorage.setItem("shop_return", ret);
  window.location.href =
    mode === "register" ? "/landing/register?app=shop" : "/landing/login?app=shop";
}

/** Returns false and redirects to sign-in when guest tries to order. */
export function requireShopAuth() {
  if (isShopLoggedIn()) return true;
  toast(t("signInToOrder") || "Please sign in to order food", "user");
  goToShopAuth("login");
  return false;
}

export function applyPostLoginRedirect() {
  const back = sessionStorage.getItem("shop_return");
  if (!back || back === "#/" || back === "#") return;
  sessionStorage.removeItem("shop_return");
  if (back.startsWith("#")) {
    location.hash = back;
  }
}
