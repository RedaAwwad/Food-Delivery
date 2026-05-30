import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { fmt, stars, toast, pageHeader, $, $$ } from "../ui.js";

function qrSvg() {
  // Deterministic decorative QR-like grid
  const n = 21, cell = 9, pad = 0;
  let rects = "";
  const seed = (x, y) => ((x * 73856093) ^ (y * 19349663) ^ (x * y * 83492791)) >>> 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (fx, fy) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
    const inFinder = finder(0, 0) || finder(n - 7, 0) || finder(0, n - 7);
    let on = inFinder ? ((x === 0 || x === n - 1 || y === 0 || y === n - 1) ? false : (seed(x, y) % 2 === 0)) : (seed(x, y) % 100 < 46);
    // draw finder squares cleanly
    if (finder(0,0)||finder(n-7,0)||finder(0,n-7)) {
      const bx = x>=n-7?n-7:0, by=y>=n-7?n-7:0;
      const lx=x-bx, ly=y-by;
      on = (lx===0||lx===6||ly===0||ly===6) || (lx>=2&&lx<=4&&ly>=2&&ly<=4);
    }
    if (on) rects += `<rect x="${pad + x * cell}" y="${pad + y * cell}" width="${cell}" height="${cell}" rx="1.5"/>`;
  }
  return `<svg width="200" height="200" viewBox="0 0 ${n * cell} ${n * cell}" fill="var(--text)">${rects}</svg>`;
}

export async function renderQR(root) {
  const sample = MOCK.menuItems.slice(0, 5);
  root.innerHTML = pageHeader("QR Menu", "Contactless digital menu — scan to order", `<button class="btn btn-ghost" id="dl">${icon("download")} Download QR</button><button class="btn btn-primary" id="print">${icon("printer")} Print table cards</button>`)
    + `<div class="grid cols-3">
        <div class="card card-pad" style="text-align:center">
          <h3 style="font-size:15px;margin-bottom:4px">Your QR Code</h3>
          <p class="muted" style="font-size:12.5px;margin-bottom:18px">Customers scan to view the live menu</p>
          <div class="qr-frame" id="qrFrame">${qrSvg()}</div>
          <div style="margin-top:16px;font-weight:700">FOOD-DELIVERY</div>
          <div class="muted" style="font-size:12px">foodhub.com/m/downtown</div>
          <div class="segmented" style="margin-top:18px"><button class="active">Downtown</button><button>Midtown</button><button>Riverside</button></div>
        </div>

        <div class="card span-2" style="overflow:hidden">
          <div class="card-head"><div><h3>Live Menu Preview</h3><p>What customers see on their phone</p></div><span class="badge badge-success"><span class="bdot"></span>Live</span></div>
          <div class="card-pad" style="background:var(--surface-2)">
            <div style="max-width:380px;margin:0 auto;background:var(--surface);border-radius:26px;border:8px solid var(--text);box-shadow:var(--shadow-lg);overflow:hidden">
              <div style="height:120px;background:linear-gradient(135deg,var(--brand-400),var(--brand-600));position:relative;color:#fff;padding:18px;display:flex;flex-direction:column;justify-content:flex-end">
                <div style="position:absolute;top:14px;left:0;right:0;text-align:center;font-size:11px;opacity:.8">9:41</div>
                <strong style="font-size:18px">FOOD-DELIVERY</strong>
                <span style="font-size:12px;opacity:.9">Downtown · ${stars(4.8)}</span>
              </div>
              <div style="padding:14px">
                <div class="row" style="gap:8px;overflow:auto;padding-bottom:10px;margin-bottom:6px">${MOCK.categories.slice(0,4).map((c,i)=>`<span class="btn btn-sm ${i===0?"btn-primary":"btn-ghost"}" style="white-space:nowrap">${c.name}</span>`).join("")}</div>
                ${sample.map(m => `<div class="row" style="gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
                  <div style="width:60px;height:60px;border-radius:12px;background:url('${m.img}') center/cover;flex:none"></div>
                  <div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13.5px">${m.name}</div><div class="muted" style="font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.desc}</div><div style="font-weight:700;color:var(--brand-600);margin-top:3px">${fmt.money(m.price)}</div></div>
                  <button class="btn btn-primary btn-icon btn-sm" style="align-self:center">${icon("plus")}</button>
                </div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  $("#dl", root)?.addEventListener("click", () => toast("QR code downloaded (SVG)", "success"));
  $("#print", root)?.addEventListener("click", () => toast("Sending table cards to printer...", "default"));
  $$(".segmented button", root).forEach(b => b.addEventListener("click", () => { $$(".segmented button", root).forEach(x => x.classList.remove("active")); b.classList.add("active"); toast(`Switched to ${b.textContent} menu`, "default"); }));
}
