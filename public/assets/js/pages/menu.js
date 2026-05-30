import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { api } from "../api.js";
import { fmt, statusBadge, stars, modal, toast, confirmDialog, pageHeader, $, $$ } from "../ui.js";

let items = [];
let categories = [];
let menu = null;
let activeCat = "All";
let host;
let selectedRestaurantId = "";
let restaurants = [];

function normalize(m) {
  if (m.menuItemId) {
    return {
      menuItemId: m.menuItemId,
      menuCategoryId: m.menuCategory?.menuCategoryId || m.menuCategoryId,
      name: m.menuItemName,
      cat: m.menuCategory?.menuCategoryName || "General",
      price: m.price,
      status: m.isActive && m.stockQuantity > 0 ? "available" : "soldout",
      img: m.menuItemImageUrl || MOCK.IMG.burger,
      desc: m.menuItemDesc || "",
      rating: 4.7,
      stock: m.stockQuantity ?? 0,
    };
  }
  return m;
}

function findItem(id) {
  return items.find((i) => i.menuItemId === id);
}

function menuHeaderCard() {
  if (!menu) {
    return `<div class="card card-pad" style="margin-bottom:20px;border:2px dashed var(--border-2)">
      <div class="row between wrap" style="gap:12px">
        <div>
          <h3 style="margin:0 0 6px">No menu yet</h3>
          <p class="muted" style="margin:0;font-size:13px">Each restaurant needs one <strong>Menu</strong> before categories and dishes.</p>
        </div>
        <button class="btn btn-primary" id="createMenuBtn">${icon("plus")} Create menu</button>
      </div>
    </div>`;
  }
  return `<div class="card card-pad" style="margin-bottom:20px;background:linear-gradient(135deg,rgba(99,102,241,.12),rgba(236,72,153,.08))">
    <div class="row between wrap" style="gap:12px">
      <div>
        <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.06em">Menu</div>
        <h3 style="margin:6px 0 4px">${menu.menuDesc || "Main menu"}</h3>
        <p class="muted" style="margin:0;font-size:12px">ID: <code>${menu.menuId}</code></p>
      </div>
      <div class="row" style="gap:10px;align-items:center">
        ${statusBadge(menu.isActive ? "available" : "soldout")}
        <span class="muted" style="font-size:12px">${categories.length} categories · ${items.length} items</span>
      </div>
    </div>
  </div>`;
}

function categoriesPanel() {
  if (!menu) return "";
  const rows = categories.length
    ? categories
        .map(
          (c) => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div><strong>${c.menuCategoryName}</strong><span class="muted" style="font-size:12px;margin-left:8px">${c.itemCount ?? 0} dishes</span></div>
        <button class="btn btn-ghost btn-sm btn-danger-text" data-del-cat="${c.menuCategoryId}">${icon("trash")}</button>
      </div>`
        )
        .join("")
    : `<p class="muted" style="margin:0">No categories yet. Add one to organize menu items.</p>`;
  return `<div class="card card-pad" style="margin-bottom:20px">
    <div class="row between" style="margin-bottom:12px">
      <h4 style="margin:0">${icon("layers")} Menu categories</h4>
      <button class="btn btn-ghost btn-sm" id="addCategoryBtn">${icon("plus")} Add category</button>
    </div>
    ${rows}
  </div>`;
}

function categoriesBar() {
  const catNames = categories.map((c) => c.menuCategoryName);
  const cats = ["All", ...catNames];
  return `<div class="row wrap" style="gap:8px;margin-bottom:22px">
    ${cats
      .map((c) => {
        const count =
          c === "All" ? items.length : items.filter((i) => i.cat === c).length;
        return `<button class="btn ${c === activeCat ? "btn-primary" : "btn-ghost"} btn-sm" data-cat="${c}">${c}${c !== "All" ? ` <span style="opacity:.7">${count}</span>` : ""}</button>`;
      })
      .join("")}
  </div>`;
}

function foodCard(m) {
  const id = m.menuItemId || "";
  return `<div class="food-card food-card--vivid">
    <div class="food-card__img" style="background-image:url('${m.img}')">
      <span class="price-tag">${fmt.money(m.price)}</span>
    </div>
    <div class="food-card__body">
      <div class="row between"><h4>${m.name}</h4>${stars(m.rating)}</div>
      <p class="muted" style="font-size:12px;margin:0 0 6px">${m.cat}</p>
      <p>${m.desc || ""}</p>
      <div class="row between">
        ${statusBadge(m.status)}
        <div class="row" style="gap:6px">
          <button class="btn btn-ghost btn-sm" data-edit="${id}">${icon("edit")}</button>
          <button class="btn btn-danger btn-sm" data-del="${id}">${icon("trash")}</button>
        </div>
      </div>
    </div>
  </div>`;
}

function dishForm(m = {}) {
  const catOptions = categories.length
    ? categories
        .map(
          (c) =>
            `<option value="${c.menuCategoryId}" ${m.menuCategoryId === c.menuCategoryId ? "selected" : ""}>${c.menuCategoryName}</option>`
        )
        .join("")
    : `<option value="">— create a category first —</option>`;
  const imgs = Object.values(MOCK.IMG);
  return `
    <div class="field"><label>Dish image</label>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div id="dish-preview" style="width:90px;height:90px;border-radius:12px;border:2px dashed var(--border-2);background:${m.img ? `url('${m.img}') center/cover` : "var(--surface-2)"};display:grid;place-items:center;color:var(--text-3)">${m.img ? "" : icon("upload")}</div>
        <div style="flex:1;min-width:160px">
          <div class="muted" style="font-size:11.5px;margin-bottom:6px">Pick a sample image:</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${imgs.slice(0, 6).map((u) => `<div class="pick-img" data-url="${u}" style="width:34px;height:34px;border-radius:8px;background:url('${u}') center/cover;cursor:pointer;border:2px solid transparent"></div>`).join("")}</div>
        </div>
      </div>
    </div>
    <div class="grid cols-2" style="gap:14px">
      <div class="field" style="grid-column:span 2"><label>Menu item name</label><input class="input" id="d-name" value="${m.name || ""}"></div>
      <div class="field"><label>Category</label><select class="select" id="d-cat">${catOptions}</select></div>
      <div class="field"><label>Price ($)</label><input class="input" type="number" id="d-price" value="${m.price ?? ""}"></div>
      <div class="field"><label>Stock</label><input class="input" type="number" id="d-stock" value="${m.stock ?? 40}"></div>
      <div class="field"><label>Availability</label><select class="select" id="d-status"><option value="available" ${m.status === "available" ? "selected" : ""}>Available</option><option value="soldout" ${m.status === "soldout" ? "selected" : ""}>Sold out</option></select></div>
      <div class="field" style="grid-column:span 2"><label>Description</label><textarea class="input" id="d-desc">${m.desc || ""}</textarea></div>
    </div>`;
}

async function loadMenu(restaurantId) {
  selectedRestaurantId = restaurantId;
  const res = await api.menuForRestaurant(restaurantId);
  menu = res.data?.menu || null;
  categories = res.data?.categories || [];
  items = (res.data?.items || []).map(normalize);
  activeCat = "All";
  paint();
  const sub = host.closest(".main")?.querySelector("#pageSub") || document.querySelector("#pageSub");
  if (sub) {
    const parts = [];
    if (menu) parts.push(menu.menuDesc || "Menu");
    parts.push(`${categories.length} categories`, `${items.length} menu items`);
    parts.push(res.live ? "live from database" : "sign in as admin");
    sub.textContent = parts.join(" · ");
  }
}

function openCategoryForm() {
  const mod = modal({
    title: "Add menu category",
    body: `<div class="field"><label>Category name</label><input class="input" id="cat-name" placeholder="e.g. Starters, Mains, Drinks"></div>
      <div class="field"><label>Image URL (optional)</label><input class="input" id="cat-img" placeholder="https://..."></div>`,
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>Add category</button>`,
  });
  mod.el.querySelector("[data-save]").addEventListener("click", async () => {
    const name = $("#cat-name", mod.el).value.trim();
    if (!name) return toast("Category name required", "error");
    try {
      await api.createMenuCategory(selectedRestaurantId, {
        menuCategoryName: name,
        menuCategoryImageUrl: $("#cat-img", mod.el).value.trim(),
      });
      toast("Category added", "success");
      mod.close();
      await loadMenu(selectedRestaurantId);
    } catch (e) {
      toast(e.message || "Failed", "error");
    }
  });
}

function openForm(menuItemId) {
  const m = menuItemId ? findItem(menuItemId) : null;
  const mod = modal({
    title: m ? "Edit menu item" : "Add menu item",
    size: "lg",
    body: dishForm(m || {}),
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${m ? "Save changes" : "Add item"}</button>`,
  });
  let chosenImg = m?.img || "";
  $$(".pick-img", mod.el).forEach((p) =>
    p.addEventListener("click", () => {
      chosenImg = p.dataset.url;
      $("#dish-preview", mod.el).style.background = `url('${chosenImg}') center/cover`;
      $("#dish-preview", mod.el).innerHTML = "";
    })
  );
  mod.el.querySelector("[data-save]").addEventListener("click", async () => {
    const name = $("#d-name", mod.el).value.trim();
    if (!name) return toast("Item name required", "error");
    const menuCategoryId = $("#d-cat", mod.el).value;
    if (!menuCategoryId) return toast("Create a category first", "error");
    const body = {
      menuItemName: name,
      menuItemDesc: $("#d-desc", mod.el).value,
      menuItemImageUrl: chosenImg || MOCK.IMG.burger,
      price: +$("#d-price", mod.el).value || 0,
      stockQuantity: $("#d-status", mod.el).value === "soldout" ? 0 : +$("#d-stock", mod.el).value || 0,
      menuCategoryId,
    };
    try {
      if (m?.menuItemId) {
        await api.updateMenuItem({ menuItemId: m.menuItemId, ...body });
        toast("Menu item updated", "success");
      } else {
        await api.createMenuItem(body);
        toast("Menu item added", "success");
      }
      mod.close();
      await loadMenu(selectedRestaurantId);
    } catch (e) {
      toast(e.message || "Save failed", "error");
    }
  });
}

function paint() {
  host.querySelector("#menu-header").innerHTML = menuHeaderCard();
  host.querySelector("#menu-categories-panel").innerHTML = categoriesPanel();
  host.querySelector("#menu-cats").innerHTML = menu ? categoriesBar() : "";
  const filtered = items.filter((m) => activeCat === "All" || m.cat === activeCat);
  host.querySelector("#menu-grid").innerHTML = filtered.length
    ? filtered.map((m) => foodCard(m)).join("")
    : `<div class="empty" style="grid-column:1/-1">${icon("menu")}<p>${menu ? "No menu items in this category yet." : "Create a menu, then categories, then items."}</p></div>`;

  const avail = items.filter((i) => i.status === "available").length;
  host.querySelector("#menu-stats").innerHTML = `<div class="grid cols-4" style="margin-bottom:22px">
    <div class="stat stat--violet"><div class="stat__icon tint-brand">${icon("menu")}</div><div class="stat__label">Menu items</div><div class="stat__value">${items.length}</div></div>
    <div class="stat stat--blue"><div class="stat__icon tint-violet">${icon("layers")}</div><div class="stat__label">Categories</div><div class="stat__value">${categories.length}</div></div>
    <div class="stat stat--green"><div class="stat__icon tint-green">${icon("checkCircle")}</div><div class="stat__label">Available</div><div class="stat__value">${avail}</div></div>
    <div class="stat stat--amber"><div class="stat__icon tint-amber">${icon("dollar")}</div><div class="stat__label">Avg. Price</div><div class="stat__value">${fmt.money(items.reduce((s, i) => s + i.price, 0) / (items.length || 1))}</div></div>
  </div>`;
  bind();
}

function bind() {
  const createBtn = host.querySelector("#createMenuBtn");
  if (createBtn) {
    createBtn.addEventListener("click", async () => {
      try {
        await api.ensureMenu(selectedRestaurantId);
        toast("Menu created", "success");
        await loadMenu(selectedRestaurantId);
      } catch (e) {
        toast(e.message || "Failed", "error");
      }
    });
  }
  const addCat = host.querySelector("#addCategoryBtn");
  if (addCat) addCat.addEventListener("click", () => openCategoryForm());
  $$("[data-del-cat]", host).forEach((b) =>
    b.addEventListener("click", () =>
      confirmDialog("Delete this category and its link to items?", async () => {
        try {
          await api.deleteMenuCategory(b.dataset.delCat);
          toast("Category removed", "success");
          await loadMenu(selectedRestaurantId);
        } catch (e) {
          toast(e.message, "error");
        }
      })
    )
  );
  $$("[data-cat]", host).forEach((b) => b.addEventListener("click", () => { activeCat = b.dataset.cat; paint(); }));
  $$("[data-edit]", host).forEach((b) => b.addEventListener("click", () => openForm(b.dataset.edit)));
  $$("[data-del]", host).forEach((b) =>
    b.addEventListener("click", () =>
      confirmDialog("Remove this menu item?", async () => {
        try {
          await api.deleteMenuItem(b.dataset.del);
          toast("Menu item removed", "success");
          await loadMenu(selectedRestaurantId);
        } catch (e) {
          toast(e.message, "error");
        }
      })
    )
  );
}

export async function renderMenu(root) {
  host = root;
  const restRes = await api.restaurants("page=1&perPage=48");
  restaurants = restRes.data.map((r) => ({
    id: r.restaurantId || r.id,
    name: r.restaurantName || r.name,
  }));

  root.innerHTML =
    pageHeader(
      "Menu Management",
      "Menu → categories → menu items",
      `<button class="btn btn-ghost" id="qrBtn">${icon("qr")} QR Preview</button><button class="btn btn-primary" id="addDish">${icon("plus")} Add menu item</button>`
    ) +
    `<div class="card card-pad" style="margin-bottom:20px"><label class="field"><span style="font-weight:600;font-size:13px">Restaurant</span>
       <select class="select" id="restPicker" style="margin-top:8px">${restaurants.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}</select></label></div>
    <div id="menu-header"></div>
    <div id="menu-categories-panel"></div>
    <div id="menu-stats"></div><div id="menu-cats"></div><div class="grid cols-4" id="menu-grid" style="gap:18px"></div>`;

  root.querySelector("#addDish").addEventListener("click", () => {
    if (!menu) return toast("Create a menu first", "error");
    if (!categories.length) return toast("Add at least one category", "error");
    openForm();
  });
  root.querySelector("#qrBtn").addEventListener("click", () => (location.hash = "#/qr"));
  $("#restPicker", root).addEventListener("change", (e) => loadMenu(e.target.value));
  const preset = sessionStorage.getItem("fd_menu_restaurant");
  if (preset) {
    sessionStorage.removeItem("fd_menu_restaurant");
    const sel = $("#restPicker", root);
    if ([...sel.options].some((o) => o.value === preset)) sel.value = preset;
    await loadMenu(preset);
  } else if (restaurants[0]) await loadMenu(restaurants[0].id);
}
