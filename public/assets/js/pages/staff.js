import { icon } from "../icons.js";
import { MOCK } from "../mock.js";
import { fmt, statusBadge, avatarEl, modal, toast, confirmDialog, pageHeader, makeChart, cssVar, $, $$ } from "../ui.js";

let staff = [];
let host;

const ROLE_PERMS = {
  "Branch Manager": ["Full branch access", "Manage staff", "View reports", "Edit menu"],
  "Head Chef": ["Kitchen management", "Edit menu", "Inventory"],
  "Sous Chef": ["Kitchen access", "View menu"],
  "Cashier": ["Process payments", "View orders"],
  "Waiter": ["Take orders", "View tables"],
  "Delivery Lead": ["Manage deliveries", "View orders"],
  "Barista": ["Process drinks orders"],
};

function statsRow() {
  const active = staff.filter(s => s.status === "active").length;
  const avgAtt = Math.round(staff.reduce((s, x) => s + x.attendance, 0) / (staff.length || 1));
  const avgPerf = Math.round(staff.reduce((s, x) => s + x.perf, 0) / (staff.length || 1));
  const item = (l, v, ic, t) => `<div class="stat"><div class="stat__icon ${t}">${icon(ic)}</div><div class="stat__label">${l}</div><div class="stat__value">${v}</div></div>`;
  return `<div class="grid cols-4">
    ${item("Total Staff", staff.length, "staff", "tint-brand")}
    ${item("On Duty", active, "checkCircle", "tint-green")}
    ${item("Avg. Attendance", avgAtt + "%", "calendar", "tint-blue")}
    ${item("Avg. Performance", avgPerf + "%", "award", "tint-violet")}
  </div>`;
}

function formAdd(s = {}) {
  return `<div class="grid cols-2" style="gap:14px">
    <div class="field" style="grid-column:span 2"><label>Full name</label><input class="input" id="s-name" value="${s.name||""}" placeholder="Jane Doe"></div>
    <div class="field"><label>Role</label><select class="select" id="s-role">${Object.keys(ROLE_PERMS).map(r=>`<option ${s.role===r?"selected":""}>${r}</option>`).join("")}</select></div>
    <div class="field"><label>Branch</label><select class="select" id="s-branch">${["Downtown","Midtown","Riverside","Uptown","Queens","Harbor"].map(b=>`<option ${s.branch===b?"selected":""}>${b}</option>`).join("")}</select></div>
    <div class="field"><label>Shift</label><select class="select" id="s-shift">${["Morning","Evening","Night"].map(b=>`<option ${s.shift===b?"selected":""}>${b}</option>`).join("")}</select></div>
    <div class="field"><label>Status</label><select class="select" id="s-status"><option value="active" ${s.status==="active"?"selected":""}>Active</option><option value="leave" ${s.status==="leave"?"selected":""}>On leave</option><option value="offline" ${s.status==="offline"?"selected":""}>Offline</option></select></div>
  </div>`;
}

function openForm(s) {
  const m = modal({ title: s ? "Edit Staff Member" : "Add Staff Member", body: formAdd(s || {}),
    footer: `<button class="btn btn-ghost" data-close>Cancel</button><button class="btn btn-primary" data-save>${s ? "Save" : "Add member"}</button>` });
  m.el.querySelector("[data-save]").addEventListener("click", () => {
    const name = $("#s-name", m.el).value.trim(); if (!name) return toast("Name required", "error");
    const data = { name, role: $("#s-role",m.el).value, branch: $("#s-branch",m.el).value, shift: $("#s-shift",m.el).value, status: $("#s-status",m.el).value };
    if (s) { Object.assign(s, data); toast("Staff updated", "success"); }
    else { staff.unshift({ ...data, attendance: 100, perf: 90, avatar: MOCK.AVATAR(name) }); toast("Staff added", "success"); }
    m.close(); paint();
  });
}

function openPerms(s) {
  modal({ title: `${s.role} — Permissions`,
    body: `<div class="row" style="gap:12px;margin-bottom:18px">${avatarEl(s.avatar, s.name, "avatar")}<div><strong>${s.name}</strong><div class="muted" style="font-size:12.5px">${s.branch} branch</div></div></div>
      <div style="display:flex;flex-direction:column;gap:10px">
      ${(ROLE_PERMS[s.role] || []).map(p => `<label class="row between" style="padding:11px 14px;border:1px solid var(--border);border-radius:12px"><span class="row" style="gap:10px">${icon("checkCircle")} ${p}</span><label class="switch"><input type="checkbox" checked><span class="slider"></span></label></label>`).join("")}
      </div>`,
    footer: `<button class="btn btn-primary" data-close>Done</button>` });
}

function attendanceCard() {
  return `<div class="card span-2">
    <div class="card-head"><div><h3>Attendance Overview</h3><p>Weekly attendance rate by branch</p></div><span class="badge badge-success">93% avg</span></div>
    <div class="card-pad"><div class="chart-box" style="height:240px"><canvas id="attChart"></canvas></div></div>
  </div>`;
}
function topPerformers() {
  const top = [...staff].sort((a, b) => b.perf - a.perf).slice(0, 4);
  return `<div class="card">
    <div class="card-head"><div><h3>Top Performers</h3></div>${icon("award")}</div>
    <div class="card-pad" style="padding-top:8px">
      ${top.map((s, i) => `<div class="row" style="gap:12px;margin-bottom:14px">
        <div style="font-weight:800;color:${i===0?"var(--brand-500)":"var(--text-3)"};width:16px">${i+1}</div>
        ${avatarEl(s.avatar, s.name)}
        <div style="flex:1"><div style="font-weight:600;font-size:13.5px">${s.name}</div><div class="muted" style="font-size:12px">${s.role}</div></div>
        <div style="text-align:right;font-weight:700;color:var(--success)">${s.perf}%</div>
      </div>`).join("")}
    </div></div>`;
}

function table() {
  return `<div class="card mt">
    <div class="card-head"><div><h3>All Employees</h3><p>${staff.length} team members</p></div>
      <div class="row"><div class="search-box" style="display:flex;width:200px;height:36px"><span>${icon("search")}</span><input id="staffSearch" placeholder="Search staff..."></div></div></div>
    <div class="table-wrap"><table class="data">
      <thead><tr><th>Employee</th><th>Role</th><th>Branch</th><th>Shift</th><th>Attendance</th><th>Performance</th><th>Status</th><th></th></tr></thead>
      <tbody id="staff-body"></tbody></table></div></div>`;
}
function staffRow(s, i) {
  return `<tr>
    <td><div class="cell-user">${avatarEl(s.avatar, s.name)}<div><div class="nm">${s.name}</div><div class="sb">ID #${1000 + i}</div></div></div></td>
    <td><span class="link" data-perm="${i}" style="cursor:pointer">${s.role}</span></td>
    <td>${s.branch}</td>
    <td><span class="badge badge-neutral">${s.shift}</span></td>
    <td style="min-width:120px"><div class="row between" style="font-size:11.5px;margin-bottom:4px"><span></span><span>${s.attendance}%</span></div><div class="progress"><span style="width:${s.attendance}%"></span></div></td>
    <td style="min-width:120px"><div class="row between" style="font-size:11.5px;margin-bottom:4px"><span></span><span>${s.perf}%</span></div><div class="progress"><span style="width:${s.perf}%;background:linear-gradient(90deg,#6d5efc,#16a34a)"></span></div></td>
    <td>${statusBadge(s.status)}</td>
    <td><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-edit="${i}">${icon("edit")}</button><button class="btn btn-danger btn-sm" data-del="${i}">${icon("trash")}</button></div></td>
  </tr>`;
}

function paint() {
  host.querySelector("#staff-stats").innerHTML = statsRow();
  host.querySelector("#staff-body").innerHTML = staff.map(staffRow).join("");
  host.querySelector("#staff-perf").innerHTML = topPerformers();
  bindRows();
  drawAtt();
}
function bindRows() {
  $$("[data-edit]", host).forEach(b => b.addEventListener("click", () => openForm(staff[+b.dataset.edit])));
  $$("[data-perm]", host).forEach(b => b.addEventListener("click", () => openPerms(staff[+b.dataset.perm])));
  $$("[data-del]", host).forEach(b => b.addEventListener("click", () => confirmDialog("Remove this staff member?", () => { staff.splice(+b.dataset.del, 1); toast("Removed", "success"); paint(); })));
  const s = $("#staffSearch", host);
  if (s) s.addEventListener("input", e => { const q = e.target.value.toLowerCase(); host.querySelector("#staff-body").innerHTML = staff.filter(x => (x.name + x.role + x.branch).toLowerCase().includes(q)).map(staffRow).join(""); bindRows(); });
}
function drawAtt() {
  const cv = host.querySelector("#attChart"); if (!cv) return;
  const brand = cssVar("--brand-500"), accent = cssVar("--accent-500");
  makeChart(cv, {
    type: "bar",
    data: { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], datasets: [
      { label: "Present", data: [96,94,98,92,95,89,91], backgroundColor: brand, borderRadius: 6, barPercentage: .6 },
      { label: "Late", data: [4,6,2,8,5,11,9], backgroundColor: accent + "55", borderRadius: 6, barPercentage: .6 },
    ]},
    options: { plugins: { legend: { display: true, position: "top", align: "end", labels: { usePointStyle: true, boxWidth: 8 } } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, max: 100, ticks: { callback: v => v + "%" } } } },
  });
}

export async function renderStaff(root) {
  host = root;
  staff = MOCK.staff.map(s => ({ ...s }));
  root.innerHTML = pageHeader("Staff Management", `${staff.length} employees across all branches`, `<button class="btn btn-ghost">${icon("download")} Export</button><button class="btn btn-primary" id="addStaff">${icon("plus")} Add Staff</button>`)
    + `<div id="staff-stats"></div>
       <div class="grid cols-3 mt">${attendanceCard()}<div id="staff-perf"></div></div>
       ${table()}`;
  root.querySelector("#addStaff").addEventListener("click", () => openForm());
  paint();
}
