import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChefHat,
  Clock,
  MapPin,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { SiteHeader } from "@/components/site-header";
import { fetchPlatformStats } from "@/lib/api";

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-extrabold text-white md:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-white/50 md:text-sm">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState({ restaurants: "—", live: false });

  useEffect(() => {
    fetchPlatformStats().then((s) => {
      setStats({
        restaurants: s.restaurants > 0 ? `${s.restaurants}+` : "Many",
        live: s.live,
      });
    });
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <WebGLShader />
      <SiteHeader />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-200">
          <Sparkles className="size-4 text-orange-400" />
          Multi-branch restaurant platform
        </div>

        <div className="mx-auto w-full max-w-4xl border border-white/10 bg-black/50 p-2 shadow-2xl shadow-orange-500/10 backdrop-blur-sm">
          <main className="border border-white/10 px-4 py-12 md:px-10 md:py-14">
            <h1 className="mb-4 text-center text-4xl font-extrabold leading-[1.05] tracking-tighter text-white md:text-[clamp(2.2rem,7vw,4.5rem)]">
              Crave it?
              <br />
              <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                Delivered fresh.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-center text-sm text-white/65 md:text-lg">
              Order from real restaurants, track your meal in real time, and run every
              branch from one dashboard — menus, orders, and Stripe checkout.
            </p>

            <div className="my-8 flex items-center justify-center gap-1">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-xs font-medium text-emerald-400">
                {stats.live ? "Live API · database connected" : "Demo mode · start API for live data"}
              </p>
            </div>

            <div className="mb-10 grid grid-cols-3 gap-4 border-y border-white/10 py-8">
              <Stat value={stats.restaurants} label="Restaurants" />
              <Stat value="30 min" label="Avg. delivery" />
              <Stat value="4.8★" label="Top rated" />
            </div>

            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              <LiquidButton
                className="rounded-full border border-orange-400/40 text-white"
                size="xl"
                onClick={() => {
                  window.location.href = "/landing/restaurants";
                }}
              >
                <UtensilsCrossed className="size-5" />
                Order food now
                <ArrowRight className="size-4" />
              </LiquidButton>
              <a
                href="/landing/login?app=shop"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </a>
              <a
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Store className="size-4" />
                Restaurant dashboard
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: ChefHat,
                  title: "Menu → Categories → Items",
                  desc: "Full menu hierarchy per branch, synced with the shop.",
                },
                {
                  icon: Clock,
                  title: "Live kitchen tracking",
                  desc: "Pending → preparing → ready → delivered on every order.",
                },
                {
                  icon: MapPin,
                  title: "Multi-branch",
                  desc: "One brand, many locations — each with its own menu.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-orange-500/30"
                >
                  <Icon className="mb-2 size-5 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center gap-2 overflow-hidden rounded-xl opacity-90">
              {FOOD_IMAGES.map((src) => (
                <div
                  key={src}
                  className="h-16 w-20 flex-none rounded-lg bg-cover bg-center md:h-20 md:w-28"
                  style={{ backgroundImage: `url('${src}')` }}
                  role="img"
                  aria-label="Food"
                />
              ))}
            </div>
          </main>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/45">
          <a href="/landing/restaurants" className="hover:text-orange-300">
            Browse restaurants
          </a>
          <a href="/shop" className="hover:text-orange-300">
            Customer shop
          </a>
          <a href="/dashboard" className="hover:text-orange-300">
            Admin dashboard
          </a>
          <a href="/api-docs" className="hover:text-orange-300">
            API documentation
          </a>
          <span>© Food-Delivery</span>
        </footer>
      </div>
    </div>
  );
}
