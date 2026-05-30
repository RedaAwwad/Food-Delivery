import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { Bike } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80";

type AuthPanelProps = {
  subtitle: string;
  words: { text: string; className?: string }[];
};

export function AuthPanel({ subtitle, words }: AuthPanelProps) {
  return (
    <div
      className="relative hidden min-h-full flex-col justify-between overflow-hidden p-10 text-white lg:flex"
      style={{
        backgroundImage: `linear-gradient(150deg, rgba(15,10,8,.75), rgba(239,81,6,.45)), url('${HERO_IMG}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <a href="/landing" className="flex items-center gap-2.5 font-extrabold tracking-tight">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600">
          <Bike className="size-5" strokeWidth={2.5} />
        </span>
        FOOD<span className="text-orange-300">DELIVERY</span>
      </a>

      <div>
        <p className="mb-2 text-sm text-white/70">{subtitle}</p>
        <TypewriterEffectSmooth
          words={words}
          className="my-4 justify-start"
          cursorClassName="bg-orange-400"
        />
        <p className="max-w-md text-sm leading-relaxed text-white/75">
          Real-time orders, multi-branch menus, kitchen tracking, and Stripe checkout —
          one platform for restaurants and hungry customers.
        </p>
      </div>

      <div className="flex gap-8 text-sm">
        <div>
          <strong className="block text-2xl">Live</strong>
          <span className="text-white/60">API connected</span>
        </div>
        <div>
          <strong className="block text-2xl">4.8★</strong>
          <span className="text-white/60">Top restaurants</span>
        </div>
      </div>
    </div>
  );
}

export const LOGIN_WORDS = [
  { text: "Welcome" },
  { text: "back" },
  { text: "to" },
  { text: "FOOD-DELIVERY", className: "text-orange-400 dark:text-orange-400" },
];

export const REGISTER_WORDS = [
  { text: "Start" },
  { text: "ordering" },
  { text: "with" },
  { text: "FOOD-DELIVERY", className: "text-orange-400 dark:text-orange-400" },
];
