import { getApiBase } from "@/lib/env";

const API = getApiBase();

export type PlatformStats = {
  restaurants: number;
  live: boolean;
};

export type RestaurantSummary = {
  id: string;
  name: string;
  bio: string;
  img: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  eta: string;
};

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";

const FEATURED_IMGS = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
];

function mapRestaurant(r: Record<string, unknown>, index: number): RestaurantSummary {
  return {
    id: String(r.restaurantId || r.id || ""),
    name: String(r.restaurantName || r.name || "Restaurant"),
    bio: String(r.restaurantBio || "Fresh meals delivered to your door."),
    img: String(r.restaurantLogo || FEATURED_IMGS[index % FEATURED_IMGS.length] || DEFAULT_IMG),
    rating: Number(r.averageRating) || 4.5,
    reviews: Number(r.ratingCount) || 0,
    isOpen: r.isAvailable !== false,
    eta: "25–35 min",
  };
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    const res = await fetch(`${API}/restaurants?page=1&perPage=1`);
    if (!res.ok) throw new Error("stats failed");
    const json = await res.json();
    const total = json?.meta?.total ?? json?.data?.length ?? 0;
    return { restaurants: Number(total) || 0, live: true };
  } catch {
    return { restaurants: 0, live: false };
  }
}

export async function fetchRestaurants(perPage = 24): Promise<{
  items: RestaurantSummary[];
  live: boolean;
}> {
  try {
    const res = await fetch(`${API}/restaurants?page=1&perPage=${perPage}`);
    if (!res.ok) throw new Error("fetch failed");
    const json = await res.json();
    const arr = json?.data ?? [];
    if (!Array.isArray(arr)) return { items: [], live: false };
    return {
      items: arr.map((r: Record<string, unknown>, i: number) => mapRestaurant(r, i)),
      live: true,
    };
  } catch {
    return { items: [], live: false };
  }
}

export function goToRestaurantMenu(restaurantId: string) {
  const hash = `#/restaurant/${restaurantId}`;
  sessionStorage.setItem("shop_return", hash);
  const token = localStorage.getItem("shop_token");
  if (!token || token === "demo-token") {
    window.location.href = "/landing/login?app=shop";
    return;
  }
  window.location.href = `/shop${hash}`;
}
