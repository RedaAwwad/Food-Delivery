import { icon } from "../icons.js";
import { $, $$, money, avatarEl, toast, modal } from "../ui.js";
import { store } from "../store.js";
import { api } from "../api.js";
import { footer } from "./home.js";
import { t, LANG_OPTIONS, setLanguage, getLang } from "../i18n.js";

let tab = "info";
function profileTabs() {
  return [["info", t("tabInfo"), "user"], ["addresses", t("tabAddresses"), "pin"], ["payments", t("tabPayments"), "card"], ["prefs", t("tabPrefs"), "sun"]];
}

export async function renderProfile(root) {
  if (!api.user && !api.token) { location.hash = "#/login"; return; }
  const u = api.user || { userName: t("guestUser"), userEmail: "guest@example.com" };

  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("profile")}</span></div>
    <div class="card card-pad" style="margin-top:6px;display:flex;align-items:center;gap:18px;flex-wrap:wrap">
      ${avatarEl(u.avatar, u.userName, "avatar", 76)}
      <div style="flex:1">
        <h2 style="font-size:24px;font-weight:800">${u.userName || "User"}</h2>
        <p class="muted">${u.userEmail || ""}</p>
        <div class="row" style="gap:10px;margin-top:8px">
          <span class="badge badge-brand">${icon("star")} ${t("goldMember")}</span>
          <span class="badge badge-green">${icon("gift")} ${t("points")}</span>
        </div>
      </div>
      <div class="cards-3" style="gap:14px;grid-template-columns:repeat(3,auto)">
        ${stat(store.orders.length || 24, t("statOrders"))}
        ${stat(store.favMeals.length + store.favRest.length, t("statSaved"))}
        ${stat("4.9", t("statRating"))}
      </div>
    </div>

    <div class="cat-scroll" style="margin:22px 0 8px">
      ${profileTabs().map(([k, l, ic]) => `<button class="cat-pill ${k === tab ? "active" : ""}" data-tab="${k}">${icon(ic)} ${l}</button>`).join("")}
    </div>
    <div id="tabBody"></div>
  </div>${footer()}`;

  $$("[data-tab]", root).forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; renderProfile(root); }));
  paintTab();
}

function stat(v, l) { return `<div style="text-align:center;padding:0 14px"><div style="font-size:22px;font-weight:800">${v}</div><div class="muted" style="font-size:12px">${l}</div></div>`; }

function paintTab() {
  const body = $("#tabBody");
  if (tab === "info") body.innerHTML = infoTab();
  else if (tab === "addresses") body.innerHTML = addrTab();
  else if (tab === "payments") body.innerHTML = payTab();
  else body.innerHTML = prefsTab();
  bindTab();
}

function infoTab() {
  const u = api.user || {};
  return `<div class="card card-pad" style="max-width:640px">
    <div class="cards-2">
      <div class="field"><label>${t("fullName")}</label><input class="input" id="pf-name" value="${u.userName || ""}"></div>
      <div class="field"><label>${t("email")}</label><input class="input" id="pf-email" value="${u.userEmail || ""}"></div>
      <div class="field"><label>${t("phone")}</label><input class="input" id="pf-phone" value="+44 7700 900000"></div>
      <div class="field"><label>${t("birthday")}</label><input class="input" type="date" value="1995-06-15"></div>
    </div>
    <button class="btn btn-primary" id="saveInfo">${t("saveChanges")}</button>
  </div>`;
}
function addrTab() {
  return `<div style="max-width:640px">
    ${store.addresses.map(a => `<div class="select-tile" style="cursor:default">
      <div class="ic">${icon(a.icon || "home")}</div>
      <div style="flex:1"><div class="row between"><strong>${a.label}</strong>${a.default ? `<span class="badge badge-neutral">${t("defaultBadge")}</span>` : ""}</div><div class="muted" style="font-size:13px">${a.line}, ${a.city}</div></div>
      <button class="hbtn" style="width:34px;height:34px;background:none" data-deladdr="${a.id}">${icon("trash")}</button>
    </div>`).join("")}
    <button class="btn btn-outline" id="addAddr">${icon("plus")} ${t("addNewAddress")}</button>
  </div>`;
}
function payTab() {
  return `<div style="max-width:640px">
    ${store.cards.map(c => `<div class="select-tile" style="cursor:default"><div class="ic">${icon("card")}</div><div style="flex:1"><div class="row between"><strong>${c.brand} •••• ${c.last4}</strong>${c.default ? `<span class="badge badge-neutral">${t("defaultBadge")}</span>` : ""}</div><div class="muted" style="font-size:13px">${t("expires")} ${c.exp}</div></div><button class="hbtn" style="width:34px;height:34px;background:none" data-delcard="${c.id}">${icon("trash")}</button></div>`).join("")}
    <div class="select-tile" style="cursor:default"><div class="ic">${icon("cash")}</div><div style="flex:1"><strong>${t("cashOnDelivery")}</strong><div class="muted" style="font-size:13px">${t("cashAlways")}</div></div></div>
    <button class="btn btn-outline" id="addCard">${icon("plus")} ${t("addPayment")}</button>
  </div>`;
}
function prefsTab() {
  const rows = [[t("pushNotif"), true], [t("emailPromos"), true], [t("smsUpdates"), false], [t("aiRecs"), true]];
  return `<div class="card card-pad" style="max-width:640px">
    <h4 style="font-weight:800;margin-bottom:12px">${t("language")}</h4>
    <div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:20px">
      ${LANG_OPTIONS.map(([code, name, flag]) => `<button class="cat-pill lang-opt ${getLang() === code ? "active" : ""}" data-lang="${code}" style="padding:10px 18px">${flag} ${name}</button>`).join("")}
    </div>
    <div class="divider"></div>
    ${rows.map(([l, on]) => `<div class="opt-row"><label style="font-weight:600">${l}</label><input type="checkbox" ${on ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--brand-500)"></label></div>`).join("")}
    <div class="opt-row"><label style="font-weight:600">${t("darkMode")}</label><input type="checkbox" id="prefDark" ${store.theme === "dark" ? "checked" : ""} style="width:20px;height:20px;accent-color:var(--brand-500)"></div>
  </div>`;
}

function bindTab() {
  $("#saveInfo")?.addEventListener("click", () => { const u = api.user || {}; u.userName = $("#pf-name").value; u.userEmail = $("#pf-email").value; api.setUser(u); window.dispatchEvent(new Event("shop:auth")); toast(t("profileUpdated"), "checkC"); });
  $("#addAddr")?.addEventListener("click", () => addrModal());
  $("#addCard")?.addEventListener("click", () => cardModal());
  $$("[data-deladdr]").forEach(b => b.addEventListener("click", () => { store.addresses = store.addresses.filter(a => a.id !== b.dataset.deladdr); store.save(); paintTab(); toast(t("addressRemoved")); }));
  $$("[data-delcard]").forEach(b => b.addEventListener("click", () => { store.cards = store.cards.filter(c => c.id !== b.dataset.delcard); store.save(); paintTab(); toast(t("cardRemoved")); }));
  $("#prefDark")?.addEventListener("change", () => { import("../shop.js").then(m => m.toggleTheme()); });
  $$(".lang-opt", $("#tabBody")).forEach(b => b.addEventListener("click", () => {
    setLanguage(b.dataset.lang);
    toast(t("languageSet"));
    window.dispatchEvent(new Event("shop:lang"));
    location.reload();
  }));
}

function addrModal() {
  const m = modal(`<div class="modal__body"><h2 style="font-size:22px;font-weight:800;margin-bottom:18px">${t("addAddressTitle")}</h2>
    <div class="field"><label>${t("label")}</label><input class="input" id="ad-label" placeholder="${t("labelPh")}"></div>
    <div class="field"><label>${t("street")}</label><input class="input" id="ad-line" placeholder="123 Main Street"></div>
    <div class="field"><label>${t("city")}</label><input class="input" id="ad-city" placeholder="London"></div>
    <div class="row" style="gap:10px;margin-top:8px"><button class="btn btn-ghost" data-close style="flex:1">${t("cancel")}</button><button class="btn btn-primary" id="ad-save" style="flex:1">${t("saveAddress")}</button></div>
  </div>`);
  $("#ad-save", m.el).addEventListener("click", () => {
    const label = $("#ad-label", m.el).value.trim(); if (!label) return toast(t("labelRequired"), "x");
    store.addresses.push({ id: "a" + Date.now(), label, line: $("#ad-line", m.el).value, city: $("#ad-city", m.el).value, icon: "pin", default: false });
    store.save(); m.close(); paintTab(); toast(t("addressAdded"), "checkC");
  });
}
function cardModal() {
  const m = modal(`<div class="modal__body"><h2 style="font-size:22px;font-weight:800;margin-bottom:18px">${t("addCardTitle")}</h2>
    <div class="field"><label>${t("cardNumber")}</label><input class="input" id="cd-num" placeholder="4242 4242 4242 4242"></div>
    <div class="cards-2"><div class="field"><label>${t("expiry")}</label><input class="input" id="cd-exp" placeholder="MM/YY"></div><div class="field"><label>CVC</label><input class="input" placeholder="123"></div></div>
    <div class="row" style="gap:10px;margin-top:8px"><button class="btn btn-ghost" data-close style="flex:1">${t("cancel")}</button><button class="btn btn-primary" id="cd-save" style="flex:1">${t("addCard")}</button></div>
  </div>`);
  $("#cd-save", m.el).addEventListener("click", () => {
    const num = ($("#cd-num", m.el).value || "").replace(/\s/g, ""); if (num.length < 4) return toast(t("validCard"), "x");
    store.cards.push({ id: "c" + Date.now(), brand: "Visa", last4: num.slice(-4), exp: $("#cd-exp", m.el).value || "12/28", default: false });
    store.save(); m.close(); paintTab(); toast(t("cardAdded"), "checkC");
  });
}
