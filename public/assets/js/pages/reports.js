import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { api } from "../api.js";
import { ORDER_STATUSES, normalizeOrder } from "../orderUtils.js";
import { fmt, toast, pageHeader, makeChart, gradient, cssVar, modal, $, $$ } from "../ui.js";
import {
  downloadCsv,
  downloadExcel,
  printAsPdf,
  stamp,
} from "../exportUtils.js";

let host;
let chartData = null;
let exportContext = null;

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function buildOrderStatusRows(report) {
  const total = report.total || 0;
  return [
    ["Status", "Count", "Percent"],
    ...ORDER_STATUSES.map((s) => {
      const count = report[s.key] ?? 0;
      const pct = total ? Math.round((count / total) * 100) : 0;
      return [s.label, count, `${pct}%`];
    }),
    ["Total", total, "100%"],
  ];
}

function buildRevenueRows(rc) {
  return [
    ["Month", "Revenue ($k)", "Orders"],
    ...rc.labels.map((label, i) => [label, rc.revenue[i] ?? 0, rc.orders[i] ?? 0]),
  ];
}

function buildMealsRows(meals) {
  return [
    ["Rank", "Dish", "Category", "Unit price", "Qty sold", "Est. revenue"],
    ...meals.map((m, i) => [
      i + 1,
      m.name,
      m.cat || "",
      m.price ?? 0,
      m.sold ?? 0,
      (m.price ?? 0) * (m.sold ?? 0),
    ]),
  ];
}

function buildKpiRows(stats) {
  const s = stats || {};
  return [
    ["Metric", "Value"],
    ["Total orders", s.orders?.value ?? 0],
    ["Total revenue", s.revenue?.value ?? 0],
    ["Active branches", `${s.branches?.active ?? 0} / ${s.branches?.value ?? 0}`],
    ["Customers", s.customers?.value ?? 0],
  ];
}

function buildOrdersRows(orders) {
  return [
    ["Order ID", "Customer", "Branch", "Status", "Total", "Time"],
    ...orders.map((o) => [
      o.id,
      o.customer,
      o.branch,
      o.status,
      o.total,
      o.time,
    ]),
  ];
}

function buildFullReportRows(ctx) {
  const rows = [["Section", "Field", "Value"]];
  const push = (section, field, value) => rows.push([section, field, value]);

  push("Summary", "Period", `${ctx.periodLabel} (${ctx.from} → ${ctx.to})`);
  push("Summary", "Data source", ctx.live ? "Database" : "Demo");

  const s = ctx.stats || {};
  push("KPIs", "Total orders", s.orders?.value ?? 0);
  push("KPIs", "Total revenue", s.revenue?.value ?? 0);
  push("KPIs", "Branches active", s.branches?.active ?? 0);
  push("KPIs", "Customers", s.customers?.value ?? 0);

  ORDER_STATUSES.forEach((st) => {
    push("Order status", st.label, ctx.report[st.key] ?? 0);
  });

  (ctx.rc?.labels || []).forEach((label, i) => {
    push("Monthly revenue", label, `rev ${ctx.rc.revenue[i] ?? 0}k / orders ${ctx.rc.orders[i] ?? 0}`);
  });

  (ctx.meals || []).forEach((m, i) => {
    push("Top dishes", `#${i + 1} ${m.name}`, `${m.sold ?? 0} sold`);
  });

  return rows;
}

function rowsToHtmlTable(rows) {
  if (!rows.length) return "<p>No data</p>";
  const [head, ...body] = rows;
  return `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body
    .map((row) => `<tr>${row.map((c) => `<td>${c}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function runExport({ reportType, format, from, to, periodLabel }) {
  const ctx = {
    ...exportContext,
    from,
    to,
    periodLabel,
  };
  const { report, stats, meals, rc } = ctx;
  const base = `food-delivery_${reportType.replace(/\s+/g, "-").toLowerCase()}_${stamp()}`;

  let rows = [];
  let pdfSections = "";

  switch (reportType) {
    case "Order status report":
      rows = buildOrderStatusRows(report);
      pdfSections = `<h2>Order status</h2>${rowsToHtmlTable(rows)}`;
      break;
    case "Revenue summary":
      rows = buildRevenueRows(rc);
      pdfSections = `<h2>Revenue by month</h2>${rowsToHtmlTable(rows)}`;
      break;
    case "Best-selling dishes":
      rows = buildMealsRows(meals);
      pdfSections = `<h2>Best-selling dishes</h2>${rowsToHtmlTable(rows)}`;
      break;
    case "Full business report":
    default:
      rows = buildFullReportRows(ctx);
      pdfSections = `
        <h2>Overview</h2>${rowsToHtmlTable(buildKpiRows(stats))}
        <h2>Order status</h2>${rowsToHtmlTable(buildOrderStatusRows(report))}
        <h2>Revenue</h2>${rowsToHtmlTable(buildRevenueRows(rc))}
        <h2>Top dishes</h2>${rowsToHtmlTable(buildMealsRows(meals))}
      `;
      if (ctx.orders?.length) {
        pdfSections += `<h2>Recent orders (${ctx.orders.length})</h2>${rowsToHtmlTable(buildOrdersRows(ctx.orders.slice(0, 100)))}`;
      }
      break;
  }

  if (format === "CSV") {
    downloadCsv(base, rows);
    toast("CSV downloaded", "success");
    return;
  }
  if (format === "Excel") {
    downloadExcel(base, rows);
    toast("Excel file downloaded", "success");
    return;
  }
  if (format === "PDF") {
    printAsPdf(`Food-Delivery — ${reportType}`, pdfSections);
    toast("Print dialog opened — choose Save as PDF", "success");
    return;
  }
}

function exportModal() {
  const dates = defaultDateRange();
  const m = modal({
    title: "Export Report",
    body: `<div class="field"><label>Report type</label>
      <select class="select" id="expType">
        <option>Order status report</option>
        <option>Revenue summary</option>
        <option>Best-selling dishes</option>
        <option>Full business report</option>
      </select></div>
      <div class="grid cols-2" style="gap:14px">
        <div class="field"><label>From</label><input class="input" type="date" id="expFrom" value="${dates.from}"></div>
        <div class="field"><label>To</label><input class="input" type="date" id="expTo" value="${dates.to}"></div>
      </div>
      <div class="field"><label>Format</label>
        <div class="row" style="gap:10px" id="expFormat">
          ${["CSV", "Excel", "PDF"].map((f, i) => `
            <label class="checkbox" style="border:1px solid var(--border);padding:10px 16px;border-radius:10px;flex:1;justify-content:center;cursor:pointer">
              <input type="radio" name="expFmt" value="${f}" ${i === 0 ? "checked" : ""}> ${f}
            </label>`).join("")}
        </div>
      </div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button>
      <button class="btn btn-primary" data-export>${icon("download")} Download</button>`,
  });

  m.el.querySelector("[data-export]").addEventListener("click", async () => {
    const btn = m.el.querySelector("[data-export]");
    btn.disabled = true;
    try {
      const reportType = $("#expType", m.el)?.value || "Full business report";
      const format = m.el.querySelector('input[name="expFmt"]:checked')?.value || "CSV";
      const from = $("#expFrom", m.el)?.value || dates.from;
      const to = $("#expTo", m.el)?.value || dates.to;
      const periodBtn = host?.querySelector("#period button.active");
      const periodLabel = periodBtn?.textContent?.trim() || "30d";

      if (reportType === "Full business report" && !exportContext?.orders?.length) {
        const res = await api.adminOrders();
        exportContext.orders = res.data.map(normalizeOrder);
      }

      runExport({ reportType, format, from, to, periodLabel });
      m.close();
    } catch (e) {
      toast(e.message || "Export failed", "error");
    } finally {
      btn.disabled = false;
    }
  });
}

function orderReportSection(report, live) {
  const total = report.total || 1;
  const bar = (meta, count) => {
    const pct = Math.round((count / total) * 100);
    return `<div style="margin-bottom:14px">
      <div class="row between" style="margin-bottom:6px"><strong style="font-size:13.5px">${meta.label}</strong><span class="muted">${fmt.num(count)} orders · ${pct}%</span></div>
      <div class="progress"><span style="width:${pct}%;background:${meta.color}"></span></div>
    </div>`;
  };
  return `<div class="card mt">
    <div class="card-head">
      <div><h3>Order Status Report</h3><p>Pending, preparing, ready, delivering, completed & canceled</p></div>
      <span class="badge ${live ? "badge-success" : "badge-neutral"}">${live ? "Live" : "Demo"}</span>
    </div>
    <div class="card-pad">
      <div class="grid cols-6" style="gap:12px;margin-bottom:22px">
        ${ORDER_STATUSES.map((s) => `<div class="stat" style="box-shadow:none;border:1px solid var(--border);padding:14px">
          <div class="stat__icon ${s.tint}" style="width:36px;height:36px;margin-bottom:8px">${icon(s.icon)}</div>
          <div class="stat__label">${s.label}</div>
          <div class="stat__value" style="font-size:1.35rem">${fmt.num(report[s.key] ?? 0)}</div>
        </div>`).join("")}
      </div>
      ${ORDER_STATUSES.map((s) => bar(s, report[s.key] ?? 0)).join("")}
    </div>
  </div>`;
}

function kpis(stats) {
  const s = stats || MOCK.stats;
  const item = (l, v, d, ic, t) => `<div class="stat"><div class="stat__icon ${t}">${icon(ic)}</div><div class="stat__label">${l}</div><div class="stat__value">${v}</div><div class="stat__delta ${d >= 0 ? "up" : "down"}">${icon(d >= 0 ? "arrowUp" : "arrowDown")}${Math.abs(d)}%</div></div>`;
  return `<div class="grid cols-4">
    ${item("Total Orders", fmt.num(s.orders.value), s.orders.delta, "orders", "tint-brand")}
    ${item("Total Revenue", fmt.money(s.revenue.value), s.revenue.delta, "dollar", "tint-green")}
    ${item("Active Branches", `${s.branches.active}/${s.branches.value}`, s.branches.delta, "store", "tint-violet")}
    ${item("Customers", fmt.num(s.customers.value), s.customers.delta, "customers", "tint-blue")}
  </div>`;
}

export async function renderReports(root) {
  host = root;
  const [statsRes, ordersRes] = await Promise.all([
    api.dashboardStats(),
    api.adminOrders(),
  ]);
  const payload = statsRes.data;
  chartData = payload;
  const report = payload.orderStatusReport || { total: 0 };
  const meals = payload.popularMeals?.length ? payload.popularMeals : MOCK.bestSellers;
  const orders = ordersRes.data.map(normalizeOrder);

  exportContext = {
    report,
    stats: payload.stats,
    meals,
    rc: payload.revenueChart || MOCK.revenueChart,
    orders,
    live: statsRes.live,
  };

  root.innerHTML = pageHeader("Reports & Analytics", "Business intelligence across all branches", `<div class="segmented" id="period"><button>7d</button><button class="active">30d</button><button>90d</button><button>1y</button></div><button class="btn btn-primary" id="exportBtn">${icon("download")} Export</button>`)
    + `<div id="rep-kpis"></div>`
    + orderReportSection(report, statsRes.live)
    + `<div class="grid cols-3 mt">
         <div class="card span-2"><div class="card-head"><div><h3>Revenue Report</h3><p>Revenue trend (completed orders)</p></div></div><div class="card-pad"><div class="chart-box" style="height:280px"><canvas id="revReport"></canvas></div></div></div>
         <div class="card"><div class="card-head"><div><h3>Orders by Status</h3><p>Full breakdown</p></div></div><div class="card-pad"><div class="chart-box" style="height:200px"><canvas id="statusChart"></canvas></div><div id="statusLegend" style="margin-top:14px"></div></div></div>
       </div>
       <div class="grid cols-2 mt">
         <div class="card"><div class="card-head"><div><h3>Monthly Orders</h3><p>Order volume by month</p></div></div><div class="card-pad"><div class="chart-box" style="height:280px"><canvas id="branchChart"></canvas></div></div></div>
         <div class="card"><div class="card-head"><div><h3>Best-Selling Dishes</h3><p>Top items by quantity</p></div>${icon("fire")}</div>
           <div class="card-pad" style="padding-top:8px">${meals.map((b, i) => `
             <div style="margin-bottom:16px"><div class="row between" style="margin-bottom:6px"><span class="row" style="gap:10px"><strong style="color:var(--text-3)">${i + 1}</strong><strong style="font-size:13.5px">${b.name}</strong></span><span class="muted">${fmt.num(b.sold)} sold · ${fmt.money(b.price * (b.sold || 1))}</span></div>
             <div class="progress"><span style="width:${meals[0]?.sold ? (b.sold / meals[0].sold) * 100 : 0}%"></span></div></div>`).join("")}</div>
         </div>
       </div>`;
  root.querySelector("#rep-kpis").innerHTML = kpis(payload.stats);
  root.querySelector("#exportBtn").addEventListener("click", exportModal);
  $$("#period button", root).forEach(b => b.addEventListener("click", () => {
    $$("#period button", root).forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    toast(`Showing last ${b.textContent}`, "default");
  }));
  draw(report);
}

function draw(report) {
  const brand = cssVar("--brand-500"), accent = cssVar("--accent-500"), green = "#16a34a";
  const rc = chartData?.revenueChart || MOCK.revenueChart;
  const ctx = host.querySelector("#revReport").getContext("2d");
  makeChart(ctx, {
    type: "line",
    data: { labels: rc.labels, datasets: [
      { label: "Revenue ($k)", data: rc.revenue, borderColor: brand, borderWidth: 3, tension: .4, pointRadius: 0, fill: true, backgroundColor: gradient(ctx, 280, brand + "30", brand + "00") },
      { label: "Orders", data: rc.orders, borderColor: green, borderWidth: 3, tension: .4, pointRadius: 0, fill: true, backgroundColor: gradient(ctx, 280, green + "22", green + "00") },
    ]},
    options: { plugins: { legend: { display: true, position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } },
  });

  const statusCats = ORDER_STATUSES
    .map((s) => [s.label, report[s.key] ?? 0, s.color])
    .filter((c) => c[1] > 0);
  const statusTotal = statusCats.reduce((sum, c) => sum + c[1], 0) || 1;

  makeChart(host.querySelector("#statusChart"), {
    type: "doughnut",
    data: { labels: statusCats.map(c => c[0]), datasets: [{ data: statusCats.map(c => c[1]), backgroundColor: statusCats.map(c => c[2]), borderWidth: 0, hoverOffset: 6 }] },
    options: { cutout: "66%" },
  });
  host.querySelector("#statusLegend").innerHTML = statusCats.length
    ? statusCats.map(c =>
        `<div class="row between" style="font-size:13px;margin-bottom:8px"><span class="row" style="gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${c[2]}"></span>${c[0]}</span><strong>${Math.round((c[1] / statusTotal) * 100)}%</strong></div>`
      ).join("")
    : `<p class="muted">No orders in database yet.</p>`;

  makeChart(host.querySelector("#branchChart"), {
    type: "bar",
    data: { labels: rc.labels, datasets: [{ label: "Orders", data: rc.orders, backgroundColor: accent + "cc", borderRadius: 8, barPercentage: .6 }] },
    options: { scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } },
  });
}
