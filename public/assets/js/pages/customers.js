import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { fmt, statusBadge, avatarEl, modal, toast, pageHeader, makeChart, gradient, cssVar, $, $$ } from "../ui.js";

let customers = [];
let host;

const TIER_BADGE = { Bronze: "badge-neutral", Silver: "badge-info", Gold: "badge-warning", Platinum: "badge-brand" };

function statsRow() {
  const total = customers.length;
  const active = customers.filter(c => c.status === "active").length;
  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);
  const loyalty = customers.reduce((s, c) => s + c.loyalty, 0);
  const item = (l, v, ic, t, d) => `<div class="stat"><div class="stat__icon ${t}">${icon(ic)}</div><div class="stat__label">${l}</div><div class="stat__value">${v}</div>${d ? `<div class="stat__delta up">${icon("arrowUp")}${d}</div>` : ""}</div>`;
  return `<div class="grid cols-4">
    ${item("Total Customers", fmt.num(9241), "customers", "tint-brand", "18.7%")}
    ${item("Active", fmt.num(7820), "checkCircle", "tint-green", "9.1%")}
    ${item("Lifetime Value", fmt.money(totalSpent), "dollar", "tint-violet")}
    ${item("Loyalty Points", fmt.k(loyalty), "gift", "tint-amber")}
  </div>`;
}

function profileModal(c) {
  modal({ title: "Customer Profile", size: "lg",
    body: `<div class="row" style="gap:16px;margin-bottom:20px">
        ${avatarEl(c.avatar, c.name, "avatar")}
        <div style="flex:1"><div class="row between"><div><h3 style="font-size:18px;font-weight:700">${c.name}</h3><div class="muted" style="font-size:13px">${c.email}</div></div><span class="badge ${TIER_BADGE[c.tier]}">${icon("award")} ${c.tier}</span></div></div>
      </div>
      <div class="grid cols-3" style="gap:12px;margin-bottom:20px">
        <div class="card card-pad" style="background:var(--surface-2);text-align:center"><div class="muted" style="font-size:11.5px">Orders</div><strong style="font-size:20px">${c.orders}</strong></div>
        <div class="card card-pad" style="background:var(--surface-2);text-align:center"><div class="muted" style="font-size:11.5px">Total Spent</div><strong style="font-size:20px">${fmt.money(c.spent)}</strong></div>
        <div class="card card-pad" style="background:var(--surface-2);text-align:center"><div class="muted" style="font-size:11.5px">Loyalty</div><strong style="font-size:20px">${fmt.num(c.loyalty)}</strong></div>
      </div>
      <div class="row" style="gap:18px;margin-bottom:18px;flex-wrap:wrap">
        <div class="muted row" style="gap:6px;font-size:13px">${icon("phone")}${c.phone}</div>
        <div class="muted row" style="gap:6px;font-size:13px">${icon("calendar")}Joined ${c.joined}</div>
        <div class="muted row" style="gap:6px;font-size:13px">${icon("clock")}Last order ${c.last}</div>
      </div>
      <h4 style="font-size:13px;margin-bottom:10px">Recent Order History</h4>
      <div class="table-wrap"><table class="data" style="border:1px solid var(--border);border-radius:12px;overflow:hidden">
        <thead><tr><th>Order</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${MOCK.orders.slice(0, 4).map(o => `<tr><td><strong>${o.id}</strong></td><td>${o.items.length} items</td><td>${fmt.money(o.total)}</td><td>${statusBadge(o.status)}</td></tr>`).join("")}</tbody>
      </table></div>`,
    footer: `<button class="btn btn-ghost" data-close>Close</button><button class="btn btn-primary" data-msg>${icon("mail")} Send message</button>` });
}

function row(c, i) {
  return `<tr>
    <td><div class="cell-user">${avatarEl(c.avatar, c.name)}<div><div class="nm">${c.name}</div><div class="sb">${c.email}</div></div></div></td>
    <td><span class="badge ${TIER_BADGE[c.tier]}">${c.tier}</span></td>
    <td><strong>${c.orders}</strong></td>
    <td><strong>${fmt.money(c.spent)}</strong></td>
    <td><span class="pill-rating" style="color:var(--accent-600)">${icon("gift")} ${fmt.num(c.loyalty)}</span></td>
    <td class="muted" style="font-size:12.5px">${c.last}</td>
    <td>${statusBadge(c.status)}</td>
    <td><button class="btn btn-ghost btn-sm" data-view="${i}">View</button></td>
  </tr>`;
}

function paint() {
  host.querySelector("#cust-stats").innerHTML = statsRow();
  host.querySelector("#cust-body").innerHTML = customers.map(row).join("");
  bind();
  drawChart();
}
function bind() {
  $$("[data-view]", host).forEach(b => b.addEventListener("click", () => profileModal(customers[+b.dataset.view])));
  const s = $("#custSearch", host);
  if (s) s.addEventListener("input", e => { const q = e.target.value.toLowerCase(); host.querySelector("#cust-body").innerHTML = customers.filter(c => (c.name + c.email).toLowerCase().includes(q)).map(row).join(""); $$("[data-view]", host).forEach(b => b.addEventListener("click", () => profileModal(customers[+b.dataset.view]))); });
}
function drawChart() {
  const cv = host.querySelector("#custChart"); if (!cv) return;
  const brand = cssVar("--brand-500");
  const ctx = cv.getContext("2d");
  makeChart(ctx, {
    type: "line",
    data: { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], datasets: [{ label: "Customers", data: [320,410,480,560,640,720,810,920,1040,1180,1320,1510], borderColor: brand, borderWidth: 3, tension: .4, pointRadius: 0, fill: true, backgroundColor: gradient(ctx, 240, brand + "33", brand + "00") }] },
    options: { scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } },
  });
  const tiers = [["Platinum", 8, "#ff5a1f"], ["Gold", 22, "#d97706"], ["Silver", 35, "#2563eb"], ["Bronze", 35, "#9ca3af"]];
  host.querySelector("#tierLegend").innerHTML = tiers.map(([n, v, c]) => `<div style="margin-bottom:14px"><div class="row between" style="font-size:13px;margin-bottom:5px"><span class="row" style="gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${c}"></span>${n}</span><strong>${v}%</strong></div><div class="progress"><span style="width:${v}%;background:${c}"></span></div></div>`).join("");
}

export async function renderCustomers(root) {
  host = root;
  customers = MOCK.customers.map(c => ({ ...c }));
  root.innerHTML = pageHeader("Customers", `${fmt.num(9241)} registered customers`, `<button class="btn btn-ghost">${icon("download")} Export</button><button class="btn btn-primary">${icon("plus")} Add Customer</button>`)
    + `<div id="cust-stats"></div>
       <div class="grid cols-3 mt">
         <div class="card span-2"><div class="card-head"><div><h3>Customer Growth</h3><p>Cumulative registered customers</p></div><span class="badge badge-success"><span class="bdot"></span>Growing</span></div><div class="card-pad"><div class="chart-box" style="height:240px"><canvas id="custChart"></canvas></div></div></div>
         <div class="card"><div class="card-head"><div><h3>Loyalty Tiers</h3></div>${icon("award")}</div><div class="card-pad" id="tierLegend"></div></div>
       </div>
       <div class="card mt">
         <div class="card-head"><div><h3>All Customers</h3></div><div class="search-box" style="display:flex;width:220px;height:36px"><span>${icon("search")}</span><input id="custSearch" placeholder="Search customers..."></div></div>
         <div class="table-wrap"><table class="data">
           <thead><tr><th>Customer</th><th>Tier</th><th>Orders</th><th>Spent</th><th>Loyalty</th><th>Last Order</th><th>Status</th><th></th></tr></thead>
           <tbody id="cust-body"></tbody></table></div></div>`;
  paint();
}
