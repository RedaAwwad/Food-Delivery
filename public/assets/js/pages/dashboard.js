import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { api } from "../api.js";
import { normalizeOrder, ORDER_STATUSES, chartSegmentsFromReport, activeOrderCount } from "../orderUtils.js";
import { fmt, statusBadge, stars, avatarEl, makeChart, gradient, cssVar } from "../ui.js";

function statCard(o) {
  const dir = o.delta >= 0 ? "up" : "down";
  return `<div class="stat">
    <div class="stat__icon ${o.tint}">${icon(o.icon)}</div>
    <div class="stat__label">${o.label}</div>
    <div class="stat__value">${o.value}</div>
    <div class="stat__delta ${dir}">${icon(o.delta >= 0 ? "arrowUp" : "arrowDown")}${Math.abs(o.delta)}% <span class="muted" style="font-weight:500">vs last month</span></div>
    <canvas class="stat__spark" width="80" height="34" data-spark='${JSON.stringify(o.series||[])}' data-color="${o.color}"></canvas>
  </div>`;
}

function orderStatusCards(report, live) {
  const badge = live
    ? '<span class="badge badge-success"><span class="bdot"></span>Live</span>'
    : '<span class="badge badge-neutral">Demo</span>';
  return `<div class="mt">
    <div class="row between" style="margin-bottom:12px">
      <h3 style="font-size:15px;font-weight:700;margin:0">Order status</h3>
      ${badge}
    </div>
    <div class="grid cols-6" style="gap:14px">
    ${ORDER_STATUSES.map((it) => `<div class="card card-pad">
      <div class="stat__icon ${it.tint}" style="width:36px;height:36px;margin-bottom:10px">${icon(it.icon)}</div>
      <div class="stat__label">${it.label}</div>
      <div class="stat__value">${fmt.num(report[it.key] ?? 0)}</div>
      <div class="muted" style="font-size:12px;margin-top:4px">${report.total ? Math.round(((report[it.key] ?? 0) / report.total) * 100) : 0}% of orders</div>
    </div>`).join("")}
    </div>
  </div>`;
}

export async function renderDashboard(root) {
  const [statsRes, ordersRes] = await Promise.all([
    api.dashboardStats(),
    api.adminOrders(),
  ]);
  const payload = statsRes.data;
  const s = payload.stats || MOCK.stats;
  const report = payload.orderStatusReport || { total: 0 };
  const recent = ordersRes.data.slice(0, 6).map(normalizeOrder);
  const meals = payload.popularMeals?.length ? payload.popularMeals : MOCK.popularMeals;
  const notifs = payload.notifications?.length ? payload.notifications : MOCK.notifications;
  const rc = payload.revenueChart || MOCK.revenueChart;
  const live = statsRes.live && ordersRes.live;
  const apiError = statsRes.error || ordersRes.error;

  window.__fdDashboardChart = rc;
  const segments = chartSegmentsFromReport(report);
  window.__fdChannelSplit = segments.length ? segments : MOCK.channelSplit;

  const badgeEl = document.querySelector('.nav-item[href="#/orders"] .nav-badge');
  if (badgeEl) {
    const n = activeOrderCount(report);
    badgeEl.textContent = n > 0 ? String(n) : "";
  }

  const banner = live
    ? `<div class="card card-pad live-banner live-banner--ok"><div class="row"><span class="live-banner__icon">${icon("checkCircle")}</span><div><strong>Live data</strong><div class="muted" style="font-size:13px">${fmt.num(report.total ?? 0)} orders loaded from the database</div></div></div></div>`
    : `<div class="card card-pad live-banner live-banner--warn"><div class="row"><span class="live-banner__icon">${icon("bell")}</span><div><strong>Demo data</strong><div class="muted" style="font-size:13px">${apiError ? apiError + " — " : ""}Sign in as <code>admin@admin.com</code> / <code>Pass@123</code> to load real database stats.</div></div></div></div>`;

  root.innerHTML = `
    ${banner}
    <div class="grid cols-4">
      ${statCard({ label: "Total Orders", value: fmt.num(s.orders.value), delta: s.orders.delta, icon: "orders", tint: "tint-brand", series: s.orders.series, color: "#ff5a1f" })}
      ${statCard({ label: "Total Revenue", value: fmt.money(s.revenue.value), delta: s.revenue.delta, icon: "dollar", tint: "tint-green", series: s.revenue.series, color: "#16a34a" })}
      ${statCard({ label: "Active Branches", value: `${s.branches.active}/${s.branches.value}`, delta: s.branches.delta, icon: "store", tint: "tint-violet", series: s.orders.series?.slice(-12) || [], color: "#6d5efc" })}
      ${statCard({ label: "Total Customers", value: fmt.num(s.customers.value), delta: s.customers.delta, icon: "customers", tint: "tint-blue", series: s.customers.series?.length ? s.customers.series : s.orders.series?.slice(-8) || [], color: "#2563eb" })}
    </div>

    ${orderStatusCards(report, live)}

    <div class="grid cols-3 mt">
      <div class="card span-2">
        <div class="card-head">
          <div><h3>Revenue Overview</h3><p>Monthly revenue from completed orders</p></div>
        </div>
        <div class="card-pad"><div class="chart-box" style="height:300px"><canvas id="revChart"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-head"><div><h3>Order Status</h3><p>All statuses including canceled</p></div></div>
        <div class="card-pad">
          <div class="chart-box" style="height:200px"><canvas id="channelChart"></canvas></div>
          <div id="channelLegend" style="margin-top:16px"></div>
        </div>
      </div>
    </div>

    <div class="grid cols-3 mt">
      <div class="card span-2">
        <div class="card-head"><div><h3>Recent Orders</h3><p>Latest transactions ${live ? "from database" : "(demo)"}</p></div>
          <a class="btn btn-ghost btn-sm" href="#/orders">View all</a></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Order</th><th>Customer</th><th>Branch</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>${recent.length ? recent.map(o => `<tr>
            <td><strong>#${o.id}</strong><div class="sb muted" style="font-size:11.5px">${o.time}</div></td>
            <td><div class="cell-user">${avatarEl(o.avatar, o.customer)}<div class="nm">${o.customer}</div></div></td>
            <td>${o.branch}</td>
            <td><strong>${fmt.money(o.total)}</strong></td>
            <td>${statusBadge(o.status)}</td></tr>`).join("") : `<tr><td colspan="5"><div class="empty muted" style="padding:24px">No orders yet.</div></td></tr>`}
          </tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-head"><div><h3>Popular Meals</h3><p>Best sellers</p></div>${icon("fire","")}</div>
        <div class="card-pad" style="padding-top:8px">
          ${meals.map((m, i) => `<div class="row" style="margin-bottom:14px;gap:12px">
            <div style="font-weight:800;color:var(--text-3);width:18px">${i + 1}</div>
            <div style="width:46px;height:46px;border-radius:12px;background:${m.img ? `url('${m.img}') center/cover` : "var(--surface-3)"};flex:none"></div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</div>
              <div class="muted" style="font-size:12px">${m.cat} · ${stars(m.rating)}</div>
            </div>
            <div style="text-align:right"><div style="font-weight:700">${fmt.money(m.price)}</div><div class="muted" style="font-size:11.5px">${fmt.num(m.sold)} sold</div></div>
          </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="card mt">
      <div class="card-head"><div><h3>Notifications</h3></div><span class="badge badge-brand">${notifs.length} recent</span></div>
      <div class="card-pad" style="padding-top:6px">
        ${notifs.map(n => `<div class="notif-item">
          <div class="notif-ic ${n.tint}">${icon(n.icon)}</div>
          <div><div class="nb">${n.title}</div><div class="nt">${n.time}</div></div></div>`).join("")}
      </div>
    </div>`;

  drawCharts();
  drawSparks(root);
}

function drawSparks(root) {
  root.querySelectorAll("canvas[data-spark]").forEach(cv => {
    const data = JSON.parse(cv.dataset.spark || "[]");
    const color = cv.dataset.color || "#ff5a1f";
    const ctx = cv.getContext("2d");
    makeChart(cv, {
      type: "line",
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 2, tension: .4, pointRadius: 0, fill: true, backgroundColor: gradient(ctx, 34, color + "55", color + "00") }] },
      options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } }, elements: { line: { capBezierPoints: true } } },
    });
  });
}

function drawCharts() {
  const brand = cssVar("--brand-500"), accent = cssVar("--accent-500");
  const rc = window.__fdDashboardChart || MOCK.revenueChart;
  const revEl = document.getElementById("revChart");
  if (!revEl) return;
  const revCtx = revEl.getContext("2d");
  makeChart(revCtx, {
    type: "bar",
    data: { labels: rc.labels, datasets: [
      { type: "line", label: "Revenue ($k)", data: rc.revenue, borderColor: brand, borderWidth: 3, tension: .4, pointRadius: 0, pointHoverRadius: 5, fill: true, backgroundColor: gradient(revCtx, 300, brand + "33", brand + "00"), yAxisID: "y" },
      { label: "Orders", data: rc.orders, backgroundColor: accent + "cc", borderRadius: 6, barThickness: 14, yAxisID: "y1" },
    ]},
    options: { interaction: { intersect: false, mode: "index" }, plugins: { legend: { display: true, position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8, padding: 16 } }, tooltip: { padding: 12, cornerRadius: 10 } },
      scales: { y: { beginAtZero: true, ticks: { callback: v => "$" + v + "k" } }, y1: { position: "right", beginAtZero: true, grid: { drawOnChartArea: false } }, x: { grid: { display: false } } } },
  });

  const cs = window.__fdChannelSplit || MOCK.channelSplit;
  makeChart(document.getElementById("channelChart"), {
    type: "doughnut",
    data: { labels: cs.map(c => c.label), datasets: [{ data: cs.map(c => c.value), backgroundColor: cs.map(c => c.color), borderWidth: 0, hoverOffset: 6 }] },
    options: { cutout: "68%", plugins: { legend: { display: false } } },
  });
  document.getElementById("channelLegend").innerHTML = cs.map(c => `
    <div class="row between" style="margin-bottom:9px;font-size:13px">
      <span class="row" style="gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:${c.color}"></span>${c.label}</span>
      <strong>${c.value}%</strong></div>`).join("");
}
