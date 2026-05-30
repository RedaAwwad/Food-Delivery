import { icon } from "../icons.js";
import { api } from "../api.js";
import { $, toast } from "../ui.js";

const HERO = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80";

function visual() {
  return `
  <div class="auth__visual">
    <div class="auth-photo" style="background-image:url('${HERO}')"></div>
    <div class="row" style="gap:12px">
      <div class="brand-logo">${icon("chef")}</div>
      <div class="brand-name" style="color:#fff">FOOD-DELIVERY<span style="color:rgba(255,255,255,.6)">RESTAURANT OS</span></div>
    </div>
    <div class="auth-quote">
      <h2>Run every branch of your restaurant from one beautiful dashboard.</h2>
      <p>Real-time orders, menus, staff, customers and analytics — built for modern multi-branch restaurant brands.</p>
      <div class="auth-stats">
        <div><strong>12+</strong><span>Active branches</span></div>
        <div><strong>18.4k</strong><span>Orders / month</span></div>
        <div><strong>4.9★</strong><span>Avg rating</span></div>
      </div>
    </div>
    <div class="row wrap" style="gap:14px;color:rgba(255,255,255,.5);font-size:12px">
      <a href="/landing" style="color:rgba(255,255,255,.7)">Platform home</a>
      <a href="/shop" style="color:rgba(255,255,255,.7)">Customer shop</a>
      <span>© FOOD-DELIVERY</span>
    </div>
  </div>`;
}

function field(id, label, type, ph, ic, action) {
  return `<div class="field"><label>${label}</label>
    <div class="input-group">
      <span class="ig-icon">${icon(ic)}</span>
      <input class="input" id="${id}" type="${type}" placeholder="${ph}" autocomplete="off">
      ${action ? `<span class="ig-action" id="${id}-toggle">${icon("eye")}</span>` : ""}
    </div></div>`;
}

function loginForm() {
  return `
    <h1>Welcome back 👋</h1>
    <p class="sub">Sign in with your admin account (seed: admin@admin.com / Pass@123)</p>
    <div class="social-row">
      <button class="social-btn">${gIcon()} Google</button>
      <button class="social-btn">${aIcon()} Apple</button>
    </div>
    <div class="or-divider">or continue with email</div>
    ${field("email","Email address","email","admin@admin.com","mail")}
    ${field("password","Password","password","••••••••","lock",true)}
    <div class="checkbox-row">
      <label class="checkbox"><input type="checkbox" checked> Remember me</label>
      <a class="link" href="#/forgot">Forgot password?</a>
    </div>
    <button class="btn btn-primary btn-block" id="submitBtn" style="height:46px">Sign in</button>
    <div class="auth-foot">Don't have an account? <a href="#/register">Create one</a></div>`;
}
function registerForm() {
  return `
    <h1>Create account</h1>
    <p class="sub">Start managing your restaurant in minutes</p>
    ${field("name","Full name","text","Jane Doe","user")}
    ${field("email","Email address","email","you@restaurant.com","mail")}
    ${field("phone","Phone number","text","+1 (212) 555-0100","phone")}
    ${field("password","Password","password","Create a strong password","lock",true)}
    <div class="checkbox-row" style="margin-top:4px">
      <label class="checkbox"><input type="checkbox" checked> I agree to the <a class="link" href="#/register">Terms</a> & <a class="link" href="#/register">Privacy</a></label>
    </div>
    <button class="btn btn-primary btn-block" id="submitBtn" style="height:46px">Create account</button>
    <div class="auth-foot">Already have an account? <a href="#/login">Sign in</a></div>`;
}
function forgotForm() {
  return `
    <h1>Reset password</h1>
    <p class="sub">Enter your email and we'll send a secure reset link</p>
    ${field("email","Email address","email","you@restaurant.com","mail")}
    <button class="btn btn-primary btn-block" id="submitBtn" style="height:46px">Send reset link</button>
    <div class="auth-foot"><a href="#/login">← Back to sign in</a></div>`;
}

export function renderAuth(root, mode, onAuthed) {
  const form = mode === "register" ? registerForm() : mode === "forgot" ? forgotForm() : loginForm();
  root.innerHTML = `<div class="auth">${visual()}<div class="auth__form"><div class="auth__form-inner">${form}</div></div></div>`;

  ["password"].forEach(id => {
    const t = $(`#${id}-toggle`);
    if (t) t.addEventListener("click", () => {
      const inp = $(`#${id}`);
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      t.innerHTML = icon(show ? "eyeOff" : "eye");
    });
  });

  $("#submitBtn").addEventListener("click", async () => {
    const btn = $("#submitBtn");
    btn.disabled = true; const orig = btn.textContent; btn.textContent = "Please wait...";
    try {
      if (mode === "register") {
        const r = await api.register({ userName: $("#name")?.value, userEmail: $("#email")?.value, userPassword: $("#password")?.value, customerPhone: $("#phone")?.value });
        toast(r.demo ? "Demo account created — signing you in" : "Account created!", "success");
        const a = await api.login($("#email").value, $("#password").value);
        if (a.ok) onAuthed();
      } else if (mode === "forgot") {
        await api.forgot($("#email")?.value || "");
        toast("If that email exists, a reset link is on its way", "success");
        setTimeout(() => location.hash = "#/login", 900);
      } else {
        const r = await api.login($("#email").value, $("#password").value);
        if (r.ok) { toast("Welcome back — loading live data", "success"); onAuthed(); }
      }
    } catch (e) {
      toast(e.message || "Something went wrong", "error");
    } finally { btn.disabled = false; btn.textContent = orig; }
  });

  root.querySelectorAll(".input").forEach(i => i.addEventListener("keydown", e => { if (e.key === "Enter") $("#submitBtn").click(); }));
}

function gIcon(){return `<svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.1 29.5 5 24 5 16 5 9.1 9.5 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.1 40.4 16 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C40.9 36.5 45 31 45 24c0-1.2-.1-2.3-.4-3.5z"/></svg>`;}
function aIcon(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.3 1.2 0 1.6-.8 3.1-.8s1.8.8 3.1.8c1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6s-2.5-1-2.6-3.9zM14.3 5.3c.7-.8 1.1-2 1-3.1-1 0-2.1.7-2.8 1.5-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3z"/></svg>`;}
