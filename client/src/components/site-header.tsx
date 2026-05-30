import { Bike, LayoutDashboard, ShoppingBag, BookOpen, LogIn, UtensilsCrossed } from "lucide-react";

const links = [
  { href: "/landing/restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { href: "/shop", label: "Order food", icon: ShoppingBag },
  { href: "/landing/login?app=shop", label: "Sign in", icon: LogIn },
  { href: "/dashboard", label: "Restaurant OS", icon: LayoutDashboard },
  { href: "/api-docs", label: "API", icon: BookOpen },
];

export function SiteHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="/landing" className="flex items-center gap-2.5 font-extrabold tracking-tight text-white">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
            <Bike className="size-5 text-white" strokeWidth={2.5} />
          </span>
          <span>
            FOOD<span className="text-orange-400">DELIVERY</span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </nav>
        <a
          href="/shop"
          className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 md:hidden"
        >
          Order
        </a>
      </div>
    </header>
  );
}
