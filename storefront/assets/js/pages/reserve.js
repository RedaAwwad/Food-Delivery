import { icon } from "../icons.js";
import { $, $$, toast, modal } from "../ui.js";
import { api } from "../api.js";
import { footer } from "./home.js";
import { t, dateLocale } from "../i18n.js";

const TIMES = ["12:00", "12:30", "13:00", "13:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
let sel = { rest: null, date: null, time: null, guests: 2 };

export async function renderReserve(root) {
  const restaurants = await api.restaurants();
  if (!sel.rest) sel.rest = restaurants[0].id;
  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  if (!sel.date) sel.date = dates[0].toISOString().slice(0, 10);

  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">Home</a>${icon("chevR")}<span>Reservations</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>Reserve a table</h2><p>Book your spot in a few taps</p></div></div>

    <div class="with-side" style="grid-template-columns:1fr 380px">
      <div class="card card-pad">
        <div class="field"><label>${t("restaurantLabel")}</label>
          <select class="select" id="restSel">${restaurants.map(r => `<option value="${r.id}" ${r.id === sel.rest ? "selected" : ""}>${r.name}</option>`).join("")}</select>
        </div>

        <div class="field"><label>${icon("calendar")} ${t("selectDate")}</label>
          <div class="cat-scroll" id="dateRow">
            ${dates.map(d => { const v = d.toISOString().slice(0, 10); return `<button class="cat-pill ${v === sel.date ? "active" : ""}" data-date="${v}" style="flex-direction:column;height:auto;padding:10px 16px;text-align:center;display:flex"><span style="font-size:11px;opacity:.7">${d.toLocaleDateString(dateLocale(), { weekday: "short" })}</span><strong style="font-size:17px">${d.getDate()}</strong></button>`; }).join("")}
          </div>
        </div>

        <div class="field"><label>${icon("clock")} ${t("selectTime")}</label>
          <div class="row wrapf" id="timeRow" style="gap:8px">${TIMES.map(t => `<button class="cat-pill" data-time="${t}">${t}</button>`).join("")}</div>
        </div>

        <div class="field"><label>${icon("users")} ${t("numGuests")}</label>
          <div class="row" style="gap:14px">
            <div class="qty" style="height:50px"><button data-g="-1">${icon("minus")}</button><span id="guests" style="min-width:40px;font-size:16px">${sel.guests}</span><button data-g="1">${icon("plus")}</button></div>
            <span class="muted">${sel.guests > 8 ? t("largeParty") : t("guestsLabel")}</span>
          </div>
        </div>

        <div class="field"><label>${t("specialRequests")}</label><textarea class="input" id="reqNote" placeholder="${t("requestsPh")}"></textarea></div>
      </div>

      <div class="side-card">
        <div class="card card-pad">
          <h3 style="font-weight:800;margin-bottom:14px">${t("resSummary")}</h3>
          <div id="resSummary"></div>
          <button class="btn btn-primary btn-block btn-lg" id="confirmRes" style="margin-top:14px">${t("confirmRes")}</button>
          <p class="muted" style="text-align:center;font-size:12px;margin-top:12px">${icon("shield")} ${t("freeCancel")}</p>
        </div>
      </div>
    </div>
  </div>${footer()}`;

  const refresh = () => {
    const r = restaurants.find(x => x.id === sel.rest);
    const d = new Date(sel.date);
    $("#resSummary").innerHTML = `
      <div class="summary-row"><span>${icon("home")} ${t("restaurantLabel")}</span><strong style="color:var(--text)">${r.name}</strong></div>
      <div class="summary-row"><span>${icon("calendar")} ${t("selectDate")}</span><strong style="color:var(--text)">${d.toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric" })}</strong></div>
      <div class="summary-row"><span>${icon("clock")} ${t("selectTime")}</span><strong style="color:var(--text)">${sel.time || "—"}</strong></div>
      <div class="summary-row"><span>${icon("users")} ${t("guestsLabel")}</span><strong style="color:var(--text)">${sel.guests}</strong></div>`;
  };
  refresh();

  $("#restSel", root).addEventListener("change", e => { sel.rest = e.target.value; refresh(); });
  $$("[data-date]", root).forEach(b => b.addEventListener("click", () => { sel.date = b.dataset.date; $$("[data-date]").forEach(x => x.classList.remove("active")); b.classList.add("active"); refresh(); }));
  $$("[data-time]", root).forEach(b => b.addEventListener("click", () => { sel.time = b.dataset.time; $$("[data-time]").forEach(x => x.classList.remove("active")); b.classList.add("active"); refresh(); }));
  $$("[data-g]", root).forEach(b => b.addEventListener("click", () => { sel.guests = Math.max(1, sel.guests + (+b.dataset.g)); $("#guests").textContent = sel.guests; refresh(); }));
  $("#confirmRes", root).addEventListener("click", () => {
    if (!sel.time) return toast(t("pickTime"), "x");
    const r = restaurants.find(x => x.id === sel.rest);
    const d = new Date(sel.date);
    modal(`<div class="modal__body" style="text-align:center;padding:40px 28px">
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(15,174,110,.14);color:var(--green-600);display:grid;place-items:center;margin:0 auto 18px">${icon("checkC")}</div>
      <h2 style="font-size:24px;font-weight:800">${t("resConfirmed")}</h2>
      <p class="muted" style="margin:8px 0 20px">${t("resBooked", { n: sel.guests, name: r.name, date: d.toLocaleDateString(dateLocale(), { weekday: "long", month: "long", day: "numeric" }), time: sel.time })}</p>
      <div class="card card-pad" style="background:var(--surface-2);text-align:left;margin-bottom:20px">
        <div class="summary-row"><span>${t("confirmation")}</span><strong style="color:var(--text)">#RSV-${Math.floor(1000 + Math.random() * 8999)}</strong></div>
        <div class="summary-row" style="margin-bottom:0"><span>${t("status")}</span><span class="badge badge-green">${t("confirmed")}</span></div>
      </div>
      <button class="btn btn-primary btn-block btn-lg" data-close>${t("done")}</button>
    </div>`);
    toast(t("tableReserved"), "checkC");
  });
}
