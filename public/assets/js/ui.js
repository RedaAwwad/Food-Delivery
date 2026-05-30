// Shared UI utilities: formatting, toasts, modals, charts, i18n.
import { icon } from "./icons.js";

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const fmt = {
  money: (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }),
  money2: (n) => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  num: (n) => Number(n || 0).toLocaleString("en-US"),
  k: (n) => n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : "" + n,
};

export function initials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}
export function avatarEl(src, name, cls = "avatar") {
  if (src && src.startsWith("http")) return `<img class="${cls}" src="${src}" alt="${name}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'${cls}',textContent:'${initials(name)}'}))">`;
  return `<div class="${cls}">${initials(name)}</div>`;
}

const STATUS_MAP = {
  open: ["badge-success", "Open"], closed: ["badge-neutral", "Closed"],
  available: ["badge-success", "Available"], soldout: ["badge-danger", "Sold out"],
  active: ["badge-success", "Active"], inactive: ["badge-neutral", "Inactive"],
  leave: ["badge-warning", "On leave"], offline: ["badge-neutral", "Offline"],
  pending: ["badge-warning", "Pending"], preparing: ["badge-info", "Preparing"],
  ready: ["badge-brand", "Ready"], delivering: ["badge-info", "Delivering"],
  completed: ["badge-success", "Completed"], canceled: ["badge-danger", "Canceled"],
};
export function statusBadge(s) {
  const [cls, label] = STATUS_MAP[s] || ["badge-neutral", s];
  return `<span class="badge ${cls}"><span class="bdot"></span>${label}</span>`;
}

export function stars(rating) {
  return `<span class="pill-rating">${icon("star")}${Number(rating).toFixed(1)}</span>`;
}

// ---------- Toasts ----------
let toastWrap;
export function toast(msg, type = "default") {
  if (!toastWrap) { toastWrap = document.createElement("div"); toastWrap.className = "toast-wrap"; document.body.appendChild(toastWrap); }
  const ic = type === "success" ? "checkCircle" : type === "error" ? "x" : "bell";
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="color:var(--brand-500)">${icon(ic)}</span><span>${msg}</span>`;
  toastWrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(40px)"; el.style.transition = "all .3s"; setTimeout(() => el.remove(), 300); }, 3200);
}

// ---------- Modal ----------
export function modal({ title, body, size = "", footer = "" }) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal ${size}" role="dialog">
      <div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-close>${icon("x")}</button></div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ""}
    </div>`;
  document.body.appendChild(overlay);
  const close = () => { overlay.style.opacity = "0"; overlay.style.transition = "opacity .2s"; setTimeout(() => overlay.remove(), 200); };
  overlay.addEventListener("click", (e) => { if (e.target === overlay || e.target.closest("[data-close]")) close(); });
  document.addEventListener("keydown", function esc(e){ if(e.key==="Escape"){close();document.removeEventListener("keydown",esc);} });
  return { el: overlay, close };
}

export function confirmDialog(message, onConfirm) {
  const m = modal({
    title: "Please confirm",
    body: `<p style="color:var(--text-2)">${message}</p>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-danger" data-ok>Delete</button>`,
  });
  m.el.querySelector("[data-ok]").addEventListener("click", () => { onConfirm(); m.close(); });
}

// ---------- Charts (Chart.js) ----------
export function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

export function makeChart(canvas, config) {
  if (!window.Chart) return null;
  const grid = cssVar("--border");
  const text = cssVar("--text-3");
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = text;
  // inject grid colors
  config.options = config.options || {};
  config.options.maintainAspectRatio = false;
  config.options.plugins = config.options.plugins || {};
  config.options.plugins.legend = config.options.plugins.legend || { display: false };
  if (config.options.scales) {
    for (const k of Object.keys(config.options.scales)) {
      config.options.scales[k].grid = { color: grid, drawBorder: false, ...(config.options.scales[k].grid||{}) };
      config.options.scales[k].ticks = { color: text, ...(config.options.scales[k].ticks||{}) };
    }
  }
  return new Chart(canvas, config);
}

export function gradient(ctx, h, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  return g;
}

// ---------- i18n (lightweight) ----------
export const I18N = {
  en: { dir: "ltr" }, ar: { dir: "rtl" }, fr: { dir: "ltr" }, es: { dir: "ltr" },
};

// ---------- Skeletons ----------
export function skelCards(n = 4) {
  return `<div class="grid cols-4">${Array(n).fill('<div class="skel skel-card"></div>').join("")}</div>`;
}
export function skelTable(rows = 6) {
  return `<div class="card card-pad">${Array(rows).fill('<div class="skel skel-line" style="height:38px"></div>').join("")}</div>`;
}

export function pageHeader(title, subtitle, actions = "") {
  return `<div class="row between wrap" style="margin-bottom:22px;gap:14px">
    <div><h2 style="font-size:22px;font-weight:800;letter-spacing:-.4px">${title}</h2>
    <p class="muted" style="font-size:13.5px;margin-top:3px">${subtitle}</p></div>
    <div class="row wrap">${actions}</div></div>`;
}
