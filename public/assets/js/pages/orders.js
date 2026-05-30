import { icon } from "../icons.js";
import { api } from "../api.js";
import { normalizeOrder, ORDER_STATUSES, activeOrderCount } from "../orderUtils.js";
import { fmt, statusBadge, avatarEl, modal, toast, pageHeader, $, $$ } from "../ui.js";

let orders = [];
let filter = "all";
let search = "";
let host;
let liveTimer;
let isLive = false;

const FLOW = ["pending", "preparing", "ready", "delivering", "completed"];

function statsRow() {
  const c = (s) => orders.filter(o => o.status === s).length;
  const item = (meta, pulse) => `<div class="stat"><div class="stat__icon ${meta.tint}">${icon(meta.icon)}</div><div class="stat__label">${meta.label} ${pulse && isLive ?'<span class="dot-online" style="margin-left:4px"></span>':''}</div><div class="stat__value">${c(meta.key)}</div></div>`;
  return `<div class="grid cols-6" style="gap:12px">
    ${ORDER_STATUSES.map((s) => item(s, s.key !== "completed" && s.key !== "canceled")).join("")}
  </div>`;
}

function filterBar() {
  const tabs = [["all","All"],["pending","Pending"],["preparing","Preparing"],["ready","Ready"],["delivering","Delivering"],["completed","Completed"],["canceled","Canceled"]];
  return `<div class="card card-pad" style="padding:14px 18px;margin:22px 0">
    <div class="row between wrap" style="gap:12px">
      <div class="row wrap" style="gap:6px">
        ${tabs.map(([k, l]) => `<button class="btn btn-sm ${k === filter ? "btn-dark" : "btn-ghost"}" data-f="${k}">${l}</button>`).join("")}
      </div>
      <div class="row" style="gap:10px">
        <div class="search-box" style="display:flex;width:220px;height:36px"><span>${icon("search")}</span><input id="ordSearch" placeholder="Search orders..." value="${search}"></div>
        <button class="btn btn-ghost btn-sm">${icon("filter")} Filters</button>
      </div>
    </div>
  </div>`;
}

function row(o) {
  const itemsLabel = o.items.map(i => `${i.qty}× ${i.name}`).join(", ");
  return `<tr data-open="${o.id}" style="cursor:pointer">
    <td><strong>${o.id}</strong><div class="muted" style="font-size:11.5px">${o.channel}</div></td>
    <td><div class="cell-user">${avatarEl(o.avatar, o.customer)}<div><div class="nm">${o.customer}</div><div class="sb">${o.branch}</div></div></div></td>
    <td style="max-width:240px"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px">${itemsLabel}</div></td>
    <td><strong>${fmt.money(o.total)}</strong></td>
    <td><span class="badge badge-neutral">${o.payment}</span></td>
    <td>${statusBadge(o.status)}</td>
    <td class="muted" style="font-size:12.5px">${o.time}</td>
  </tr>`;
}

function timeline(o) {
  const idx = FLOW.indexOf(o.status);
  if (o.status === "canceled") {
    return `<div class="row" style="gap:12px;color:var(--danger)">${icon("x")} Order was canceled</div>`;
  }
  return `<div style="position:relative;padding-left:6px">
    ${FLOW.map((s, i) => {
      const done = i <= idx; const current = i === idx;
      const labels = { pending: "Order placed", preparing: "Kitchen preparing", ready: "Ready for pickup", delivering: "Out for delivery", completed: "Delivered" };
      return `<div class="row" style="gap:14px;align-items:flex-start;${i < FLOW.length - 1 ? "padding-bottom:18px" : ""};position:relative">
        ${i < FLOW.length - 1 ? `<div style="position:absolute;left:13px;top:26px;bottom:-2px;width:2px;background:${done ? "var(--brand-500)" : "var(--border)"}"></div>` : ""}
        <div style="width:28px;height:28px;border-radius:50%;flex:none;display:grid;place-items:center;${done ? "background:var(--brand-500);color:#fff" : "background:var(--surface-3);color:var(--text-3)"};${current?"box-shadow:0 0 0 4px var(--brand-100)":""}">${done ? icon("check") : `<span style="width:7px;height:7px;border-radius:50%;background:currentColor"></span>`}</div>
        <div style="padding-top:3px"><div style="font-weight:${current ? 700 : 600};font-size:13.5px">${labels[s]}</div><div class="muted" style="font-size:12px">${done ? (current ? "In progress" : "Completed") : "Pending"}</div></div>
      </div>`;
    }).join("")}
  </div>`;
}

function openDetails(o) {
  const itemsHTML = o.items.map(i => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
    <div class="row" style="gap:10px"><span class="badge badge-neutral">${i.qty}×</span><span style="font-weight:500">${i.name}</span></div>
    <strong>${fmt.money(i.qty * Math.round(o.total / o.items.reduce((s, x) => s + x.qty, 0)))}</strong></div>`).join("");
  const m = modal({
    title: `Order ${o.id}`, size: "lg",
    body: `<div class="grid cols-2" style="gap:22px">
      <div>
        <div class="row between" style="margin-bottom:14px">${statusBadge(o.status)}<span class="muted" style="font-size:12.5px">${o.time} · ${o.channel}</span></div>
        <div class="card card-pad" style="background:var(--surface-2);margin-bottom:16px">
          <div class="row" style="gap:12px">${avatarEl(o.avatar, o.customer, "avatar")}<div><strong>${o.customer}</strong><div class="muted" style="font-size:12.5px">${o.branch} branch</div></div></div>
        </div>
        <h4 style="font-size:13px;margin-bottom:6px">Items</h4>
        ${itemsHTML}
        <div class="row between" style="padding-top:14px;font-size:16px"><strong>Total</strong><strong style="color:var(--brand-600)">${fmt.money(o.total)}</strong></div>
        <div class="muted row" style="gap:6px;margin-top:8px;font-size:12.5px">${icon("card")} Paid via ${o.payment}</div>
      </div>
      <div>
        <h4 style="font-size:13px;margin-bottom:16px">Order Timeline</h4>
        ${timeline(o)}
      </div>
    </div>`,
    footer: `<button class="btn btn-ghost" data-close>${icon("printer")} Print</button>
      ${o.status !== "completed" && o.status !== "canceled" ? `<button class="btn btn-danger" data-cancel>Cancel order</button><button class="btn btn-primary" data-advance>${icon("check")} Advance status</button>` : `<button class="btn btn-primary" data-close>Close</button>`}`,
  });
  m.el.querySelector("[data-advance]")?.addEventListener("click", async () => {
    await advance(o);
    m.close();
    openDetails(orders.find((x) => x.id === o.id));
  });
  m.el.querySelector("[data-cancel]")?.addEventListener("click", async () => {
    await setStatus(o, "canceled");
    toast(`Order ${o.id} canceled`, "error");
    m.close();
    paint();
  });
}

async function setStatus(o, status) {
  if (!o.orderId || !isLive) {
    o.status = status;
    return;
  }
  try {
    if (status === "canceled") {
      await api.updateOrderStatus(o.orderId, "CANCELED");
    } else if (status === "completed") {
      await api.updateKitchenStatus(o.orderId, "completed");
    } else {
      await api.updateKitchenStatus(o.orderId, status);
    }
    const res = await api.adminOrders();
    orders = res.data.map(normalizeOrder);
    const updated = orders.find((x) => x.orderId === o.orderId);
    if (updated) Object.assign(o, updated);
    else o.status = status;
  } catch (e) {
    toast(e.message || "Update failed", "error");
  }
}

async function advance(o) {
  const i = FLOW.indexOf(o.status);
  if (i < 0 || i >= FLOW.length - 1) return;
  const next = FLOW[i + 1];
  await setStatus(o, next);
  toast(`Order ${o.id} → ${next}`, "success");
  paint();
}

function paint() {
  host.querySelector("#ord-stats").innerHTML = statsRow();
  host.querySelector("#ord-filter").innerHTML = filterBar();
  const list = orders.filter(o => (filter === "all" || o.status === filter) && (!search || (o.id + o.customer + o.branch).toLowerCase().includes(search.toLowerCase())));
  host.querySelector("#ord-body").innerHTML = list.length ? list.map(row).join("") : `<tr><td colspan="7"><div class="empty">${icon("orders")}<p>No orders match your filters.</p></div></td></tr>`;
  bind();
}
function bind() {
  $$("[data-f]", host).forEach(b => b.addEventListener("click", () => { filter = b.dataset.f; paint(); }));
  const s = $("#ordSearch", host);
  if (s) s.addEventListener("input", (e) => { search = e.target.value; const list = orders.filter(o => (filter === "all" || o.status === filter) && (!search || (o.id + o.customer + o.branch).toLowerCase().includes(search.toLowerCase()))); host.querySelector("#ord-body").innerHTML = list.map(row).join(""); $$("[data-open]", host).forEach(r => r.addEventListener("click", () => openDetails(orders.find(o => o.id === r.dataset.open)))); });
  $$("[data-open]", host).forEach(r => r.addEventListener("click", () => openDetails(orders.find(o => o.id === r.dataset.open))));
}

export async function renderOrders(root) {
  host = root;
  if (liveTimer) clearInterval(liveTimer);
  root.innerHTML = pageHeader("Orders", "Loading orders...", `<span class="badge badge-success" id="liveBadge" style="height:32px;display:none"><span class="dot-online"></span> Live</span><button class="btn btn-ghost btn-sm" id="refreshOrd">${icon("zap")} Refresh</button><button class="btn btn-primary" id="newOrder">${icon("plus")} New Order</button>`)
    + `<div id="ord-stats"></div><div id="ord-filter"></div>
       <div class="card"><div class="table-wrap"><table class="data">
         <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Time</th></tr></thead>
         <tbody id="ord-body"></tbody></table></div></div>`;
  const res = await api.adminOrders();
  isLive = res.live;
  orders = res.data.map(normalizeOrder);
  const sub = root.querySelector("#pageSub") || root.closest(".main")?.querySelector("#pageSub");
  if (sub) sub.textContent = `${orders.length} orders ${res.live ? "· live from API" : "· demo data"}`;
  root.querySelector("#newOrder").addEventListener("click", () => toast("Customers place orders from /shop", "default"));
  $("#liveBadge", root)?.style && (root.querySelector("#liveBadge").style.display = isLive ? "inline-flex" : "none");
  root.querySelector("#refreshOrd")?.addEventListener("click", async () => {
    const res = await api.adminOrders();
    orders = res.data.map(normalizeOrder);
    paint();
    toast("Orders refreshed", "success");
  });
  paint();

  if (isLive) {
    liveTimer = setInterval(async () => {
      if (!document.body.contains(host)) { clearInterval(liveTimer); return; }
      const res = await api.adminOrders();
      orders = res.data.map(normalizeOrder);
      paint();
    }, 30000);
  }

  const badgeEl = document.querySelector('.nav-item[href="#/orders"] .nav-badge');
  if (badgeEl) {
    const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s.key, orders.filter(o => o.status === s.key).length]));
    const n = activeOrderCount({ ...counts, total: orders.length });
    badgeEl.textContent = n > 0 ? String(n) : "";
  }

  if (liveTimer) clearInterval(liveTimer);
  if (!res.live) {
    liveTimer = setInterval(() => {
      if (!document.body.contains(host)) { clearInterval(liveTimer); return; }
      const active = orders.filter(o => ["pending","preparing","ready","delivering"].includes(o.status));
      if (active.length) { const pick = active[Math.floor(Math.random() * active.length)]; advance(pick); }
    }, 9000);
  }
}
