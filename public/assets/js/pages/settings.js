import { icon } from "../icons.js";
import { toast, pageHeader, $, $$ } from "../ui.js";
import { toggleTheme } from "../app.js";

let host;
let tab = "restaurant";

const TABS = [["restaurant", "Restaurant", "store"], ["theme", "Appearance", "sun"], ["language", "Language", "globe"], ["payments", "Payments", "card"], ["notifications", "Notifications", "bell"]];

function tabsBar() {
  return `<div class="tabs">${TABS.map(([k, l, ic]) => `<button class="tab ${k === tab ? "active" : ""}" data-tab="${k}">${l}</button>`).join("")}</div>`;
}

function row(label, sub, control) {
  return `<div class="row between" style="padding:16px 0;border-bottom:1px solid var(--border);gap:18px;flex-wrap:wrap">
    <div><div style="font-weight:600;font-size:14px">${label}</div><div class="muted" style="font-size:12.5px">${sub}</div></div>
    <div>${control}</div></div>`;
}
function sw(checked) { return `<label class="switch"><input type="checkbox" ${checked ? "checked" : ""}><span class="slider"></span></label>`; }

function restaurant() {
  return `<div class="card card-pad" style="max-width:760px">
    <div class="row" style="gap:16px;margin-bottom:22px">
      <div style="width:72px;height:72px;border-radius:18px;background:linear-gradient(135deg,var(--brand-400),var(--brand-600));display:grid;place-items:center;color:#fff">${icon("chef")}</div>
      <div><button class="btn btn-ghost btn-sm">${icon("upload")} Change logo</button><div class="muted" style="font-size:12px;margin-top:6px">PNG or SVG, max 2MB</div></div>
    </div>
    <div class="grid cols-2" style="gap:16px">
      <div class="field"><label>Restaurant name</label><input class="input" value="FOOD-DELIVERY"></div>
      <div class="field"><label>Support email</label><input class="input" value="support@foodhub.com"></div>
      <div class="field"><label>Phone</label><input class="input" value="+1 (212) 555-0100"></div>
      <div class="field"><label>Currency</label><select class="select"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option><option>SAR (﷼)</option></select></div>
      <div class="field" style="grid-column:span 2"><label>Bio</label><textarea class="input">Premium multi-branch restaurant brand serving fresh, chef-crafted meals across the city.</textarea></div>
    </div>
    <div class="row between" style="margin-top:8px"><span></span><button class="btn btn-primary" data-save>Save changes</button></div>
  </div>`;
}
function theme() {
  return `<div class="card card-pad" style="max-width:760px">
    <h3 style="font-size:15px;margin-bottom:6px">Theme mode</h3>
    <p class="muted" style="font-size:13px;margin-bottom:16px">Choose how the dashboard looks</p>
    <div class="row" style="gap:14px;margin-bottom:8px">
      <button class="card card-pad theme-pick" data-mode="light" style="flex:1;text-align:left;border:2px solid var(--brand-500)"><div style="height:50px;border-radius:8px;background:linear-gradient(135deg,#fff,#f3f4f6);border:1px solid var(--border);margin-bottom:10px"></div><strong>${icon("sun")} Light</strong></button>
      <button class="card card-pad theme-pick" data-mode="dark" style="flex:1;text-align:left"><div style="height:50px;border-radius:8px;background:linear-gradient(135deg,#0b0f1a,#1c2438);margin-bottom:10px"></div><strong>${icon("moon")} Dark</strong></button>
    </div>
    <div class="divider"></div>
    <h4 style="font-size:14px;margin-bottom:12px">Accent color</h4>
    <div class="row" style="gap:10px">${["#ff5a1f","#6d5efc","#16a34a","#2563eb","#db2777","#d97706"].map((c, i) => `<button class="accent-pick" data-c="${c}" style="width:38px;height:38px;border-radius:50%;background:${c};border:3px solid ${i === 0 ? "var(--text)" : "transparent"};cursor:pointer"></button>`).join("")}</div>
    ${row("Compact mode", "Reduce spacing to fit more on screen", sw(false))}
    ${row("Sidebar always expanded", "Keep the sidebar open on desktop", sw(true))}
  </div>`;
}
function language() {
  const langs = [["English", "🇺🇸", true], ["العربية (Arabic)", "🇸🇦", false]];
  return `<div class="card card-pad" style="max-width:760px">
    <h3 style="font-size:15px;margin-bottom:6px">Display language</h3>
    <p class="muted" style="font-size:13px;margin-bottom:16px">Multi-language ready — RTL supported</p>
    <div class="grid cols-2" style="gap:12px">${langs.map(([n, f, a]) => `<button class="card card-pad lang-pick row between" style="border:2px solid ${a ? "var(--brand-500)" : "var(--border)"}"><span class="row" style="gap:10px;font-size:22px">${f}<span style="font-size:14px;font-weight:600">${n}</span></span>${a ? icon("check") : ""}</button>`).join("")}</div>
    ${row("Auto-translate menus", "Automatically translate dish names for customers", sw(true))}
  </div>`;
}
function payments() {
  const provs = [["Stripe", "Connected", true, "#635bff"], ["PayPal", "Connected", true, "#003087"], ["Cash on Delivery", "Enabled", true, "#16a34a"], ["Apple Pay", "Not connected", false, "#000"], ["Google Pay", "Not connected", false, "#4285f4"]];
  return `<div class="card card-pad" style="max-width:760px">
    <h3 style="font-size:15px;margin-bottom:16px">Payment integrations</h3>
    ${provs.map(([n, s, on, c]) => `<div class="row between" style="padding:14px 0;border-bottom:1px solid var(--border)">
      <div class="row" style="gap:12px"><div style="width:42px;height:42px;border-radius:11px;background:${c}1a;color:${c};display:grid;place-items:center">${icon("card")}</div>
      <div><div style="font-weight:600;font-size:14px">${n}</div><div class="badge ${on ? "badge-success" : "badge-neutral"}" style="margin-top:3px">${s}</div></div></div>
      ${on ? `<button class="btn btn-ghost btn-sm">Manage</button>` : `<button class="btn btn-primary btn-sm">Connect</button>`}
    </div>`).join("")}
  </div>`;
}
function notifications() {
  return `<div class="card card-pad" style="max-width:760px">
    <h3 style="font-size:15px;margin-bottom:8px">Notification preferences</h3>
    ${row("New orders", "Get notified instantly for every new order", sw(true))}
    ${row("Low stock alerts", "Alert when an item is running low", sw(true))}
    ${row("Daily summary email", "Receive a daily performance digest", sw(true))}
    ${row("New customer reviews", "Notify me when customers leave reviews", sw(false))}
    ${row("Payout confirmations", "Notify me when payouts are processed", sw(true))}
    ${row("Marketing tips", "Occasional growth & marketing tips", sw(false))}
  </div>`;
}

function paint() {
  host.querySelector("#set-tabs").innerHTML = tabsBar();
  const map = { restaurant, theme, language, payments, notifications };
  host.querySelector("#set-body").innerHTML = (map[tab] || restaurant)();
  bind();
}
function bind() {
  $$("[data-tab]", host).forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; paint(); }));
  $$("[data-save]", host).forEach(b => b.addEventListener("click", () => toast("Settings saved", "success")));
  $$(".theme-pick", host).forEach(b => b.addEventListener("click", () => {
    const want = b.dataset.mode; const cur = document.documentElement.getAttribute("data-theme");
    if (want !== cur) toggleTheme(); else toast("Already using this theme", "default");
  }));
  $$(".accent-pick", host).forEach(b => b.addEventListener("click", () => {
    document.documentElement.style.setProperty("--brand-500", b.dataset.c);
    document.documentElement.style.setProperty("--brand-600", b.dataset.c);
    $$(".accent-pick", host).forEach(x => x.style.borderColor = "transparent"); b.style.borderColor = "var(--text)";
    toast("Accent color updated", "success");
  }));
  $$(".lang-pick", host).forEach(b => b.addEventListener("click", () => toast("Language updated", "success")));
}

export async function renderSettings(root) {
  host = root;
  root.innerHTML = pageHeader("Settings", "Configure your restaurant platform", "") + `<div id="set-tabs"></div><div id="set-body"></div>`;
  paint();
}
