import { icon } from "../icons.js";
import { $, $$, toast } from "../ui.js";
import { api } from "../api.js";
import { t } from "../i18n.js";

const HERO = "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1000&q=80";

export async function renderAuth(root, _p, base) {
  const mode = base === "register" ? "register" : "login";
  root.innerHTML = `
  <div class="wrap" style="padding:30px 22px">
    <div class="card" style="overflow:hidden;display:grid;grid-template-columns:1fr 1fr;max-width:980px;margin:0 auto">
      <div style="background:linear-gradient(150deg,rgba(20,12,6,.6),rgba(239,81,6,.55)),url('${HERO}') center/cover;padding:44px;color:#fff;display:flex;flex-direction:column;justify-content:space-between;min-height:520px" class="auth-visual">
        <a class="logo" href="#/" style="color:#fff">${icon("bike")} FOOD<span style="color:#fff;opacity:.85">DELIVERY</span></a>
        <div>
          <h1 style="font-size:32px;font-weight:800;letter-spacing:-.8px;line-height:1.15;margin-bottom:12px">${t("authHeroTitle")}</h1>
          <p style="opacity:.9">${t("authHeroSub")}</p>
        </div>
        <div class="row" style="gap:24px">
          <div><strong style="font-size:22px;display:block">1,200+</strong><span style="opacity:.8;font-size:13px">${t("statRestaurants")}</span></div>
          <div><strong style="font-size:22px;display:block">4.9★</strong><span style="opacity:.8;font-size:13px">${t("statRating")}</span></div>
        </div>
      </div>

      <div style="padding:44px 40px">
        <h2 style="font-size:26px;font-weight:800;letter-spacing:-.5px">${mode === "register" ? t("authCreateTitle") : t("authWelcome")}</h2>
        <p class="muted" style="margin:6px 0 24px">${mode === "register" ? t("authCreateSub") : t("authLoginSub")}</p>

        ${mode === "register" ? field("name", t("fullName"), "text", "Jane Doe", "user") : ""}
        ${field("email", t("email"), "email", "you@email.com", "mail")}
        ${mode === "register" ? field("phone", t("phone"), "tel", "+44 7700 900000", "phone") : ""}
        ${field("password", t("password"), "password", "••••••••", "lock")}

        ${mode === "login" ? `<div class="row between" style="margin-bottom:18px;font-size:13.5px"><label class="row" style="gap:7px;cursor:pointer"><input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--brand-500)"> ${t("rememberMe")}</label><a class="see-all">${t("forgotPassword")}</a></div>` : `<div style="height:8px"></div>`}

        <button class="btn btn-primary btn-block btn-lg" id="authSubmit">${mode === "register" ? t("createAccount") : t("signIn")}</button>

        <div class="row" style="gap:14px;margin:20px 0;color:var(--text-3);font-size:13px"><div style="flex:1;height:1px;background:var(--border)"></div>${t("or")}<div style="flex:1;height:1px;background:var(--border)"></div></div>
        <div class="row" style="gap:12px">
          <button class="btn btn-outline" style="flex:1">${gIcon()} Google</button>
          <button class="btn btn-outline" style="flex:1">${aIcon()} Apple</button>
        </div>

        <p style="text-align:center;margin-top:24px;color:var(--text-3);font-size:14px">
          ${mode === "register" ? `${t("alreadyAccount")} <a class="see-all" href="#/login">${t("signIn")}</a>` : `${t("newHere")} <a class="see-all" href="#/register">${t("createAccount")}</a>`}
        </p>
      </div>
    </div>
  </div>
  <style>@media(max-width:760px){.auth-visual{display:none!important}.card[style*="grid-template-columns: 1fr 1fr"],.card{grid-template-columns:1fr!important}}</style>`;

  $("#authSubmit", root).addEventListener("click", async () => {
    const btn = $("#authSubmit"); btn.disabled = true; const orig = btn.textContent; btn.textContent = t("pleaseWait");
    try {
      if (mode === "register") {
        const email = $("#email").value;
        await api.register({ name: $("#name").value, email, password: $("#password").value, phone: $("#phone").value });
        toast(t("accountCreated"), "checkC");
        await api.login(email, $("#password").value);
      } else {
        await api.login($("#email").value, $("#password").value);
        toast(t("welcomeBack"), "checkC");
      }
      window.dispatchEvent(new Event("shop:auth"));
      const back = sessionStorage.getItem("shop_return");
      sessionStorage.removeItem("shop_return");
      location.hash = back || "#/";
    } catch (e) {
      toast(e.message || t("authFailed"), "x");
    } finally { btn.disabled = false; btn.textContent = orig; }
  });
  $$(".input", root).forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") $("#authSubmit").click(); }));
}

function field(id, label, type, ph, ic) {
  return `<div class="field"><label>${label}</label>
    <div style="position:relative">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-3)">${icon(ic)}</span>
      <input class="input" id="${id}" type="${type}" placeholder="${ph}" style="padding-left:44px">
    </div></div>`;
}
function gIcon(){return `<svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.1 29.5 5 24 5 16 5 9.1 9.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.1 40.4 16 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C40.9 36.5 45 31 45 24c0-1.2-.1-2.3-.4-3.5z"/></svg>`;}
function aIcon(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.3 1.2 0 1.6-.8 3.1-.8s1.8.8 3.1.8c1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.6-3.9zM14.3 5.3c.7-.8 1.1-2 1-3.1-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3z"/></svg>`;}
