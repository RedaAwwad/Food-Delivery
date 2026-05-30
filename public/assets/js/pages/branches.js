import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { api } from "../api.js";
import { fmt, statusBadge, stars, modal, toast, confirmDialog, pageHeader, $, $$ } from "../ui.js";

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

let branches = [];
let host;
let searchQ = "";

function normalize(r) {
  if (r.restaurantId || r.id?.length > 20) {
    const addrs = Array.isArray(r.addresses) ? r.addresses : [];
    const primary = addrs.find((a) => a.isPrimary) || addrs[0];
    return {
      id: r.restaurantId,
      name: r.restaurantName,
      bio: r.restaurantBio || "",
      city: primary?.city || "—",
      status: r.isAvailable ? "open" : "closed",
      orders: r.orderCount ?? r._count?.orders ?? 0,
      revenue: Number(r.revenue) || 0,
      rating: Number(r.averageRating) || 0,
      reviews: r.ratingCount ?? 0,
      manager: r.managerName || r.manager?.userName || "—",
      img: r.restaurantLogo || DEFAULT_IMG,
    };
  }
  return r;
}

function branchCard(b) {
  const cap = Math.min(100, Math.round((b.orders / 120) * 100) || 12);
  return `<div class="branch-card branch-card--vivid">
    <div class="branch-map" style="background-image:linear-gradient(rgba(15,20,34,.2),rgba(15,20,34,.45)),url('${b.img}')">
      <div class="map-pin">${icon("mapPin")}</div>
      <div style="position:absolute;top:12px;left:12px">${statusBadge(b.status)}</div>
      <div class="branch-map__actions">
        <button class="icon-btn" data-menu-branch="${b.id}" title="Manage menu">${icon("menu")}</button>
        <button class="icon-btn" data-toggle="${b.id}" title="Open / close">${icon("power")}</button>
      </div>
    </div>
    <div class="card-pad">
      <div class="row between">
        <div>
          <h3 class="branch-title">${b.name}</h3>
          <div class="muted row" style="gap:5px;font-size:12.5px;margin-top:2px">${icon("mapPin")}${b.city}</div>
        </div>
        ${stars(b.rating || 4.5)}
      </div>
      <p class="muted branch-bio">${b.bio ? b.bio.slice(0, 72) + (b.bio.length > 72 ? "…" : "") : "Restaurant branch"}</p>
      <div class="grid cols-3 branch-metrics">
        <div><div class="muted metric-label">Orders</div><strong>${fmt.k(b.orders)}</strong></div>
        <div><div class="muted metric-label">Revenue</div><strong>${fmt.money(b.revenue)}</strong></div>
        <div><div class="muted metric-label">Reviews</div><strong>${fmt.k(b.reviews)}</strong></div>
      </div>
      <div class="muted row between" style="font-size:11.5px;margin:10px 0 5px"><span>Activity</span><span>${cap}%</span></div>
      <div class="progress progress--brand"><span style="width:${cap}%"></span></div>
      <div class="divider"></div>
      <div class="row between">
        <div class="muted" style="font-size:12.5px">Manager: <strong style="color:var(--text)">${b.manager}</strong></div>
        <div class="row" style="gap:6px">
          <button class="btn btn-ghost btn-sm" data-edit="${b.id}">${icon("edit")}</button>
          <button class="btn btn-danger btn-sm" data-del="${b.id}">${icon("trash")}</button>
        </div>
      </div>
    </div>
  </div>`;
}

function summary() {
  const open = branches.filter((b) => b.status === "open").length;
  const totalRev = branches.reduce((s, b) => s + b.revenue, 0);
  const totalOrders = branches.reduce((s, b) => s + b.orders, 0);
  const avgRating = (
    branches.reduce((s, b) => s + (b.rating || 0), 0) / (branches.length || 1)
  ).toFixed(1);
  const item = (label, val, ic, tint, extra = "") =>
    `<div class="stat stat--card ${extra}"><div class="stat__icon ${tint}">${icon(ic)}</div><div class="stat__label">${label}</div><div class="stat__value">${val}</div></div>`;
  return `<div class="grid cols-4">
    ${item("Total Branches", branches.length, "store", "tint-brand", "stat--violet")}
    ${item("Open Now", `${open}/${branches.length || 0}`, "checkCircle", "tint-green", "stat--green")}
    ${item("Combined Revenue", fmt.money(totalRev), "dollar", "tint-violet", "stat--blue")}
    ${item("Total Orders", fmt.k(totalOrders), "orders", "tint-amber", "stat--amber")}
  </div>`;
}

function branchForm(b = {}) {
  return `
    <div class="grid cols-2" style="gap:14px">
      <div class="field" style="grid-column:span 2"><label>Branch name</label><input class="input" id="b-name" value="${b.name || ""}" placeholder="FoodHub Downtown"></div>
      <div class="field" style="grid-column:span 2"><label>Short bio</label><textarea class="input" id="b-bio" rows="2">${b.bio || ""}</textarea></div>
      <div class="field"><label>City / Area</label><input class="input" id="b-city" value="${b.city || ""}" placeholder="Cairo"></div>
      <div class="field"><label>Status</label><select class="select" id="b-status"><option value="open" ${b.status === "open" ? "selected" : ""}>Open</option><option value="closed" ${b.status === "closed" ? "selected" : ""}>Closed</option></select></div>
      <div class="field" style="grid-column:span 2"><label>Logo URL</label><input class="input" id="b-logo" value="${b.img && b.img !== DEFAULT_IMG ? b.img : ""}" placeholder="https://..."></div>
    </div>`;
}

function openForm(b) {
  const m = modal({
    title: b ? "Edit branch" : "Add new branch",
    size: "lg",
    body: branchForm(b || {}),
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${b ? "Save changes" : "Create branch"}</button>`,
  });
  m.el.querySelector("[data-save]").addEventListener("click", async () => {
    const name = $("#b-name", m.el).value.trim();
    if (!name) return toast("Branch name is required", "error");
    const body = {
      restaurantName: name,
      restaurantBio: $("#b-bio", m.el).value.trim(),
      city: $("#b-city", m.el).value.trim(),
      restaurantLogo: $("#b-logo", m.el).value.trim(),
      isAvailable: $("#b-status", m.el).value === "open",
    };
    try {
      if (b?.id) {
        await api.updateBranch({ restaurantId: b.id, ...body });
        toast("Branch updated in database", "success");
      } else {
        await api.createBranch(body);
        toast("Branch created — menu ready to configure", "success");
      }
      m.close();
      await loadBranches();
    } catch (e) {
      toast(e.message || "Save failed", "error");
    }
  });
}

async function loadBranches() {
  const res = await api.dashboardBranches("page=1&perPage=48");
  branches = res.data.map(normalize);
  const sub = host.closest(".main")?.querySelector("#pageSub") || document.querySelector("#pageSub");
  if (sub) {
    sub.textContent = `${branches.length} locations · ${res.live ? "live from database" : "sign in as admin"}`;
  }
  paint();
}

function filteredBranches() {
  if (!searchQ) return branches;
  const q = searchQ.toLowerCase();
  return branches.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.manager.toLowerCase().includes(q)
  );
}

function paint() {
  host.querySelector("#br-summary").innerHTML = summary();
  const list = filteredBranches();
  host.querySelector("#br-grid").innerHTML = list.length
    ? list.map(branchCard).join("")
    : `<div class="empty" style="grid-column:1/-1">${icon("store")}<p>${searchQ ? "No branches match your search." : "No branches yet — add your first location."}</p></div>`;
  bind();
}

function bind() {
  $$("[data-edit]", host).forEach((el) =>
    el.addEventListener("click", () => openForm(branches.find((x) => x.id === el.dataset.edit)))
  );
  $$("[data-del]", host).forEach((el) =>
    el.addEventListener("click", () =>
      confirmDialog("Delete this branch? Orders and menus must be removed first.", async () => {
        try {
          await api.deleteBranch(el.dataset.del);
          toast("Branch deleted", "success");
          await loadBranches();
        } catch (e) {
          toast(e.message || "Delete failed — branch may have orders", "error");
        }
      })
    )
  );
  $$("[data-menu-branch]", host).forEach((el) => {
    el.addEventListener("click", () => {
      sessionStorage.setItem("fd_menu_restaurant", el.dataset.menuBranch);
      location.hash = "#/menu";
    });
  });
  $$("[data-toggle]", host).forEach((el) =>
    el.addEventListener("click", async () => {
      try {
        await api.toggleBranch(el.dataset.toggle);
        toast("Availability updated", "success");
        await loadBranches();
      } catch (e) {
        toast(e.message, "error");
      }
    })
  );
}

export async function renderBranches(root) {
  host = root;
  const q = new URLSearchParams(location.hash.split("?")[1] || "").get("q");
  searchQ = q || "";

  root.innerHTML =
    pageHeader(
      "Branch Management",
      "Restaurant locations (branches) on your platform",
      `<div class="row" style="gap:10px">
        <input class="input" id="brSearch" placeholder="Search branches…" value="${searchQ}" style="max-width:220px;height:40px">
        <button class="btn btn-ghost" id="brRefresh">${icon("refresh")}</button>
        <button class="btn btn-primary" id="addBranch">${icon("plus")} Add branch</button>
      </div>`
    ) +
    `<div id="br-summary" class="mt"></div><div class="grid cols-3 mt" id="br-grid" style="gap:20px"></div>`;

  $("#brSearch", root).addEventListener("input", (e) => {
    searchQ = e.target.value.trim();
    paint();
  });
  root.querySelector("#brRefresh").addEventListener("click", () => loadBranches());
  root.querySelector("#addBranch").addEventListener("click", () => openForm());
  await loadBranches();
}
