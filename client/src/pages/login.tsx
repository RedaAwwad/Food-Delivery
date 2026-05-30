import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { AuthPanel, LOGIN_WORDS } from "@/components/auth-panel";
import { getAuthApp, login, redirectAfterAuth } from "@/lib/auth-api";

export default function LoginPage() {
  const [params] = useSearchParams();
  const app = getAuthApp(params);
  const [email, setEmail] = useState(app === "dashboard" ? "admin@admin.com" : "");
  const [password, setPassword] = useState(app === "dashboard" ? "Pass@123" : "");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const q = app === "shop" ? "?app=shop" : "";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password, app);
      redirectAfterAuth(app);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <AuthPanel
        subtitle={
          app === "shop"
            ? "Your next meal is one tap away"
            : "Restaurant operations dashboard"
        }
        words={LOGIN_WORDS}
      />

      <div className="flex flex-col justify-center bg-background px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <a
            href="/landing"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-orange-500 lg:hidden"
          >
            ← FOOD-DELIVERY
          </a>

          <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {app === "shop"
              ? "Order from your favorite restaurants"
              : "Admin & managers — use admin@admin.com / Pass@123 for demo"}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium">
              Email
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none ring-ring focus:ring-2"
                  placeholder="you@email.com"
                />
              </div>
            </label>

            <label className="block text-sm font-medium">
              Password
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm outline-none ring-ring focus:ring-2"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {error ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to={`/register${q}`} className="font-semibold text-orange-500 hover:underline">
              Create account
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {app === "shop" ? (
              <Link to="/login" className="hover:text-foreground">
                Restaurant dashboard login
              </Link>
            ) : (
              <Link to="/login?app=shop" className="hover:text-foreground">
                Customer shop login
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
