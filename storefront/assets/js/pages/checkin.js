import { icon } from "../icons.js";
import { $, $$, toast } from "../ui.js";
import { store } from "../store.js";
import { footer } from "./home.js";
import { t } from "../i18n.js";

function qrSvg(size = 220) {
  const n = 23, cell = size / n;
  const seed = (x, y) => ((x * 73856093) ^ (y * 19349663) ^ (x * y * 0x9e3779b1)) >>> 0;
  let rects = "";
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const f = (fx, fy) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
    let on;
    if (f(0, 0) || f(n - 7, 0) || f(0, n - 7)) {
      const bx = x >= n - 7 ? n - 7 : 0, by = y >= n - 7 ? n - 7 : 0, lx = x - bx, ly = y - by;
      on = (lx === 0 || lx === 6 || ly === 0 || ly === 6) || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
    } else on = seed(x, y) % 100 < 46;
    if (on) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" rx="1"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="#0e1116">${rects}</svg>`;
}

const BRANCHES = ["Downtown", "Riverside", "Midtown", "Uptown"];
let branch = "Downtown", checked = false;

export async function renderCheckin(root) {
  const order = store.orders[0];
  root.innerHTML = `
  <div class="wrap">
    <div class="crumb"><a href="#/">${t("home")}</a>${icon("chevR")}<span>${t("checkin")}</span></div>
    <div class="section__head" style="margin-top:6px"><div><h2>${t("checkinTitle")}</h2><p>${t("checkinSub")}</p></div></div>

    <div class="cards-2" style="align-items:start">
      <div class="card card-pad" style="text-align:center">
        <h3 style="font-weight:800;margin-bottom:6px">${t("yourQr")}</h3>
        <p class="muted" style="font-size:13.5px;margin-bottom:18px">${t("showQr")}</p>
        <div style="display:inline-block;background:#fff;padding:18px;border-radius:20px;box-shadow:var(--shadow-md)">${qrSvg()}</div>
        <div style="margin-top:16px;font-weight:800;font-size:18px">${order ? order.id : "FD-DEMO01"}</div>
        <div class="muted" style="font-size:13px">${branch} ${t("branch")}</div>
        <div id="checkStatus" style="margin-top:18px"></div>
      </div>

      <div>
        <div class="card card-pad" style="margin-bottom:20px">
          <h3 style="font-weight:800;margin-bottom:14px">${icon("pin")} ${t("selectBranch")}</h3>
          <div id="branchList">${BRANCHES.map(b => `<div class="select-tile ${b === branch ? "active" : ""}" data-branch="${b}"><div class="ic">${icon("home")}</div><div style="flex:1"><strong>FoodHub ${b}</strong><div class="muted" style="font-size:13px">${icon("clock")} ${t("openKm", { km: `0.${BRANCHES.indexOf(b) + 4}` })}</div></div></div>`).join("")}</div>
        </div>
        <div class="card card-pad">
          <h3 style="font-weight:800;margin-bottom:14px">${t("pickupStatus")}</h3>
          ${[t("orderReceived"), t("beingPrepared"), t("readyPickup")].map((s, i) => `<div class="track-step ${i < 2 ? "done" : "active"}">${i < 2 ? `<div class="ln"></div>` : ""}<div class="pt">${i < 2 ? icon("check") : icon("bag")}</div><div><h4>${s}</h4><p>${i < 2 ? t("completed") : t("almostReady")}</p></div></div>`).join("")}
          <button class="btn btn-primary btn-block btn-lg" id="checkBtn" style="margin-top:18px">${icon("qr")} ${t("checkInNow")}</button>
        </div>
      </div>
    </div>
  </div>${footer()}`;

  $$("[data-branch]", root).forEach(t => t.addEventListener("click", () => { branch = t.dataset.branch; renderCheckin(root); }));
  $("#checkBtn", root).addEventListener("click", () => {
    checked = true;
    $("#checkStatus", root).innerHTML = `<span class="badge badge-green" style="font-size:14px;padding:8px 16px">${icon("checkC")} ${t("checkedInOk")}</span>`;
    toast(t("checkedInToast"), "checkC");
  });
}
