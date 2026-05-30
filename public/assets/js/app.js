// App shell: theme, layout (sidebar + topbar), router, AI assistant, auth gate.
import { icon } from "./icons.js";
import { $, $$, avatarEl, toast } from "./ui.js";
import { api } from "./api.js";

import { renderAuth } from "./pages/auth.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderBranches } from "./pages/branches.js";
import { renderMenu } from "./pages/menu.js";
import { renderOrders } from "./pages/orders.js";
import { renderStaff } from "./pages/staff.js";
import { renderCustomers } from "./pages/customers.js";
import { renderReports } from "./pages/reports.js";
import { renderSettings } from "./pages/settings.js";
import { renderQR } from "./pages/qr.js";

const NAV = [
  { group: "Overview", items: [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "orders", label: "Orders", icon: "orders", badge: "" },
    { id: "reports", label: "Reports & Analytics", icon: "reports" },
  ]},
  { group: "Operations", items: [
    { id: "branches", label: "Branches", icon: "branch" },
    { id: "menu", label: "Menu", icon: "menu" },
    { id: "qr", label: "QR Menu", icon: "qr" },
  ]},
  { group: "People", items: [
    { id: "staff", label: "Staff", icon: "staff" },
    { id: "customers", label: "Customers", icon: "customers" },
  ]},
  { group: "System", items: [
    { id: "settings", label: "Settings", icon: "settings" },
  ]},
];

const PAGES = {
  dashboard: { title: "Dashboard", sub: "Welcome back, here's what's happening today", render: renderDashboard },
  orders: { title: "Orders", sub: "Live order tracking & management", render: renderOrders },
  reports: { title: "Reports & Analytics", sub: "Business intelligence across all branches", render: renderReports },
  branches: { title: "Branch Management", sub: "Restaurant locations — each branch has its own menu", render: renderBranches },
  menu: { title: "Menu Management", sub: "Categories, dishes, pricing & availability", render: renderMenu },
  qr: { title: "QR Menu", sub: "Contactless digital menu preview", render: renderQR },
  staff: { title: "Staff Management", sub: "Employees, roles, attendance & performance", render: renderStaff },
  customers: { title: "Customers", sub: "Profiles, loyalty & order history", render: renderCustomers },
  settings: { title: "Settings", sub: "Configure your restaurant platform", render: renderSettings },
};

const state = {
  theme: localStorage.getItem("fd_theme") || "light",
  lang: localStorage.getItem("fd_lang") || "en",
};

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  localStorage.setItem("fd_theme", state.theme);
}
export function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
  // re-render to refresh chart colors
  route();
}

function isAuthRoute(r) { return ["login", "register", "forgot"].includes(r); }
function currentRoute() { return (location.hash.replace("#/", "") || "dashboard"); }

function shell(active) {
  const navHTML = NAV.map(g => `
    <div class="nav-group-label">${g.group}</div>
    ${g.items.map(it => `
      <a class="nav-item ${it.id === active ? "active" : ""}" href="#/${it.id}">
        ${icon(it.icon)}<span>${it.label}</span>
        ${it.badge ? `<span class="nav-badge">${it.badge}</span>` : ""}
      </a>`).join("")}
  `).join("");

  return `
  <div class="app-shell">
    <div class="sidebar-backdrop" id="backdrop"></div>
    <aside class="sidebar" id="sidebar">
      <a href="/landing" class="sidebar__brand" style="text-decoration:none;color:inherit">
        <div class="brand-logo">${icon("chef")}</div>
        <div class="brand-name">FOOD-DELIVERY<span>RESTAURANT OS</span></div>
      </a>
      <nav class="sidebar__nav">${navHTML}</nav>
      <div class="sidebar__foot">
        <div class="sidebar-pro">
          <h4>${icon("sparkles")} Upgrade to Pro</h4>
          <p>Unlock advanced AI analytics & unlimited branches.</p>
          <button class="btn btn-primary btn-sm btn-block">Upgrade now</button>
        </div>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-toggle" id="menuToggle">${icon("menuBtn")}</button>
        <div class="topbar__title">
          <h1 id="pageTitle"></h1>
          <p id="pageSub"></p>
        </div>
        <div class="topbar__spacer"></div>
        <div class="search-box">
          ${icon("search")}<input placeholder="Search orders, dishes, customers..." id="globalSearch"><kbd>⌘K</kbd>
        </div>
        <button class="icon-btn" id="themeBtn" title="Toggle theme">${icon(state.theme === "dark" ? "sun" : "moon")}</button>
        <button class="icon-btn" id="langBtn" title="Language">${icon("globe")}</button>
        <button class="icon-btn" id="notifBtn" title="Notifications">${icon("bell")}<span class="dot"></span></button>
        <button class="topbar-profile" id="profileBtn">
          ${avatarEl("https://i.pravatar.cc/100?u=admin", "Admin User")}
          <div class="meta"><strong>Admin User</strong><span>Owner</span></div>
        </button>
      </header>
      <main class="content" id="view"></main>
    </div>
  </div>
  <button class="ai-fab" id="aiFab" title="AI Analytics Assistant">${icon("sparkles")}</button>`;
}

function mountShellEvents() {
  $("#themeBtn")?.addEventListener("click", toggleTheme);
  const sidebar = $("#sidebar"), backdrop = $("#backdrop");
  $("#menuToggle")?.addEventListener("click", () => { sidebar.classList.toggle("open"); backdrop.classList.toggle("show"); });
  backdrop?.addEventListener("click", () => { sidebar.classList.remove("open"); backdrop.classList.remove("show"); });
  $$(".nav-item").forEach(a => a.addEventListener("click", () => { sidebar.classList.remove("open"); backdrop.classList.remove("show"); }));
  $("#notifBtn")?.addEventListener("click", openNotifications);
  $("#langBtn")?.addEventListener("click", openLang);
  $("#profileBtn")?.addEventListener("click", openProfile);
  $("#aiFab")?.addEventListener("click", toggleAI);
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("#globalSearch")?.focus(); }
  });
  $("#globalSearch")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    if (!q) return;
    if (["order", "طلب"].some((w) => q.toLowerCase().includes(w))) location.hash = "#/orders";
    else location.hash = `#/branches?q=${encodeURIComponent(q)}`;
    e.target.value = "";
  });
}

async function refreshOrdersBadge() {
  try {
    const r = await api.dashboardStats();
    const report = r?.data?.orderStatusReport;
    if (!report || !r.live) return;
    const n =
      (report.pending || 0) +
      (report.preparing || 0) +
      (report.ready || 0) +
      (report.delivering || 0);
    const badgeEl = document.querySelector('.nav-item[href="#/orders"] .nav-badge');
    if (badgeEl) badgeEl.textContent = n > 0 ? String(n) : "";
  } catch { /* ignore */ }
}

async function loadUserProfile() {
  try {
    const r = await api.me();
    const u = r?.data;
    if (!u) return;
    const btn = $("#profileBtn");
    if (btn) {
      const name = u.userName || "User";
      const role = (u.userRoles && u.userRoles[0]) || (u.isAdmin ? "Admin" : "Manager");
      btn.innerHTML = `${avatarEl("", name)}<div class="meta"><strong>${name}</strong><span>${role}</span></div>`;
    }
  } catch { /* keep default */ }
}

let shellMounted = false;
async function route() {
  applyTheme();
  const r = currentRoute();

  if (api.token === "demo-token") {
    api.logout();
    toast("Demo session cleared — sign in with admin@admin.com to load database data", "default");
  }

  if (isAuthRoute(r) || !api.token) {
    const authPath =
      r === "register" ? "/landing/register" : r === "forgot" ? "/landing/login" : "/landing/login";
    window.location.href = authPath;
    return;
  }

  const page = PAGES[r] || PAGES.dashboard;
  if (!shellMounted) {
    document.getElementById("root").innerHTML = shell(r);
    mountShellEvents();
    shellMounted = true;
  }
  // update active nav + titles without full re-render of shell
  $$(".nav-item").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#/${r}`));
  $("#pageTitle").textContent = page.title;
  $("#pageSub").textContent = page.sub;
  $("#themeBtn").innerHTML = icon(state.theme === "dark" ? "sun" : "moon");
  loadUserProfile();
  refreshOrdersBadge();

  const view = $("#view");
  view.innerHTML = "";
  const el = document.createElement("div");
  el.className = "page";
  view.appendChild(el);
  try { await page.render(el); }
  catch (err) { console.error(err); el.innerHTML = `<div class="empty">${icon("x")}<p>Failed to render page.</p></div>`; }
}

function onAuthed() {
  shellMounted = false;
  location.hash = "#/dashboard";
  route();
}

// ---------- Topbar popovers ----------
function popover(html, anchor) {
  closePopovers();
  const pop = document.createElement("div");
  pop.className = "fd-pop card";
  pop.style.cssText = "position:fixed;z-index:120;width:340px;max-width:92vw;box-shadow:var(--shadow-lg)";
  pop.innerHTML = html;
  document.body.appendChild(pop);
  const rect = anchor.getBoundingClientRect();
  pop.style.top = rect.bottom + 10 + "px";
  pop.style.right = Math.max(12, window.innerWidth - rect.right) + "px";
  setTimeout(() => document.addEventListener("click", function h(e){ if(!pop.contains(e.target) && e.target!==anchor){ pop.remove(); document.removeEventListener("click", h);} }), 0);
  return pop;
}
function closePopovers() { $$(".fd-pop").forEach(p => p.remove()); }

async function openNotifications(e) {
  let list = [];
  try {
    const r = await api.dashboardStats();
    if (r.live && r.data?.notifications?.length) list = r.data.notifications;
  } catch { /* fallback */ }
  const { MOCK } = await import("./mock.js");
  const source = list.length ? list : MOCK.notifications;
  const items = source.map(n => `
    <div class="notif-item">
      <div class="notif-ic ${n.tint}">${icon(n.icon)}</div>
      <div><div class="nb">${n.title}</div><div class="nt">${n.time}</div></div>
    </div>`).join("");
  popover(`<div class="card-head"><h3>Notifications</h3><span class="badge badge-brand">5 new</span></div>
    <div class="card-pad" style="max-height:360px;overflow:auto;padding-top:0">${items}</div>
    <div style="padding:12px 18px;border-top:1px solid var(--border)"><a class="link" href="#/orders">View all activity →</a></div>`, e.currentTarget);
}
function openLang(e) {
  const langs = [["en","English","🇺🇸"],["ar","العربية","🇸🇦"]];
  popover(`<div class="card-head"><h3>Language</h3></div><div class="card-pad" style="padding-top:8px">
    ${langs.map(([c,n,f]) => `<button class="nav-lang btn btn-block ${c===state.lang?"btn-ghost":""}" data-lang="${c}" style="justify-content:flex-start;margin-bottom:6px">${f} &nbsp; ${n} ${c===state.lang?"✓":""}</button>`).join("")}
  </div>`, e.currentTarget);
  $$(".nav-lang").forEach(b => b.addEventListener("click", () => {
    state.lang = b.dataset.lang; localStorage.setItem("fd_lang", state.lang);
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    closePopovers(); toast(`Language set to ${b.textContent.trim()}`, "success");
  }));
}
function openProfile(e) {
  popover(`<div class="card-pad">
    <div class="row" style="margin-bottom:14px">${avatarEl("https://i.pravatar.cc/100?u=admin","Admin","avatar")}<div><strong>Admin User</strong><div class="muted" style="font-size:12px">admin@foodhub.com</div></div></div>
    <a class="nav-item" href="#/settings" style="color:var(--text-2)">${icon("user")} My Profile</a>
    <a class="nav-item" href="#/settings" style="color:var(--text-2)">${icon("settings")} Settings</a>
    <a class="nav-item" href="#/reports" style="color:var(--text-2)">${icon("reports")} Billing</a>
    <div class="divider"></div>
    <button class="nav-item" id="logoutBtn" style="color:var(--danger);width:100%">${icon("logout")} Sign out</button>
  </div>`, e.currentTarget);
  $("#logoutBtn")?.addEventListener("click", () => { api.logout(); closePopovers(); shellMounted=false; location.hash="#/login"; route(); });
}

// ---------- AI Assistant ----------
let aiOpen = false;
function toggleAI() {
  if (aiOpen) { $("#aiPanel")?.remove(); aiOpen = false; return; }
  aiOpen = true;
  const panel = document.createElement("div");
  panel.className = "ai-panel"; panel.id = "aiPanel";
  panel.innerHTML = `
    <div class="ai-head row between">
      <div class="row" style="gap:10px">${icon("sparkles")}<div><strong>AI Analytics</strong><div style="font-size:11px;opacity:.85">Ask about your business</div></div></div>
      <button class="icon-btn" id="aiClose" style="background:rgba(255,255,255,.15);color:#fff;border:none">${icon("x")}</button>
    </div>
    <div class="ai-msgs" id="aiMsgs">
      <div class="ai-msg bot">👋 Hi! I'm your AI analytics assistant. I can summarize revenue, spot trends, and recommend actions across all your branches.</div>
      <div class="ai-msg bot">Try one of these:</div>
      <div class="row wrap" style="gap:6px">
        <button class="ai-chip" data-q="What's today's revenue?">Today's revenue</button>
        <button class="ai-chip" data-q="Which branch performs best?">Best branch</button>
        <button class="ai-chip" data-q="What should I restock?">Restock advice</button>
      </div>
    </div>
    <div class="ai-input">
      <input class="input" id="aiInput" placeholder="Ask anything..." style="height:40px">
      <button class="btn btn-primary btn-icon" id="aiSend">${icon("send")}</button>
    </div>`;
  document.body.appendChild(panel);
  $("#aiClose").addEventListener("click", toggleAI);
  const send = (q) => {
    const text = q || $("#aiInput").value.trim();
    if (!text) return;
    const msgs = $("#aiMsgs");
    msgs.insertAdjacentHTML("beforeend", `<div class="ai-msg me">${text}</div>`);
    $("#aiInput").value = "";
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      msgs.insertAdjacentHTML("beforeend", `<div class="ai-msg bot">${aiReply(text)}</div>`);
      msgs.scrollTop = msgs.scrollHeight;
    }, 500);
  };
  $("#aiSend").addEventListener("click", () => send());
  $("#aiInput").addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
  $$(".ai-chip", panel).forEach(c => c.addEventListener("click", () => send(c.dataset.q)));
}
function aiReply(q) {
  q = q.toLowerCase();
  if (q.includes("revenue")) return "📈 Today's revenue is <b>$12,480</b>, up <b>8.2%</b> vs yesterday. Midtown branch is leading with $4,120.";
  if (q.includes("branch")) return "🏆 <b>FoodHub Midtown</b> is your top performer — 4,102 orders, $98.7k revenue, and a 4.9★ rating this month.";
  if (q.includes("restock") || q.includes("stock")) return "⚠️ Restock soon: <b>Wagyu Ribeye</b> (sold out) and <b>Molten Lava Cake</b> (18 left). Demand is trending up 22%.";
  if (q.includes("customer")) return "👥 You gained <b>176 new customers</b> this month (+18.7%). Gold-tier retention is at 84%.";
  return "Based on current data, your platform is trending positively. Orders are up 12.5% and customer growth is strong. Want a deeper breakdown by branch?";
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", () => {
  if (state.lang !== "en" && state.lang !== "ar") {
    state.lang = "en";
    localStorage.setItem("fd_lang", "en");
  }
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  route();
});
