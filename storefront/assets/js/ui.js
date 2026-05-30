import { icon } from "./icons.js";
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export const money = (n) => "$" + Number(n || 0).toFixed(2);
export const money0 = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
export const initials = (n = "") => n.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export function avatarEl(src, name, cls = "avatar", size = 38) {
  const st = `width:${size}px;height:${size}px;font-size:${Math.round(size/2.6)}px`;
  if (src && src.startsWith("http")) return `<img class="${cls}" style="${st}" src="${src}" alt="${name}">`;
  return `<div class="${cls}" style="${st}">${initials(name)}</div>`;
}

export function stars(r) { return `<span class="rating">${icon("star")}${Number(r).toFixed(1)}</span>`; }

let tw;
export function toast(msg, ic = "checkC") {
  if (!tw) { tw = document.createElement("div"); tw.className = "toast-wrap"; document.body.appendChild(tw); }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon(ic)}<span>${msg}</span>`;
  tw.appendChild(el);
  setTimeout(() => { el.style.transition = "opacity .3s,transform .3s"; el.style.opacity = "0"; el.style.transform = "translateY(10px)"; setTimeout(() => el.remove(), 300); }, 2400);
}

export function modal(html, size = "") {
  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal ${size}">${html}</div>`;
  document.body.appendChild(ov);
  const close = () => { ov.style.opacity = "0"; ov.style.transition = "opacity .2s"; setTimeout(() => ov.remove(), 200); };
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest("[data-close]")) close(); });
  document.addEventListener("keydown", function esc(e){ if(e.key==="Escape"){close();document.removeEventListener("keydown",esc);} });
  return { el: ov, close };
}

export function discountTag(pct) { return `<span class="badge badge-red">-${pct}%</span>`; }
