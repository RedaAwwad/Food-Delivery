import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RestaurantCard } from "@/components/ui/restaurant-card";
import { fetchRestaurants, goToRestaurantMenu, type RestaurantSummary } from "@/lib/api";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function toCardProps(r: RestaurantSummary, featured = false) {
  return {
    tag: r.isOpen ? "Open now" : "Closed",
    date: `${r.eta} · ${r.reviews} reviews`,
    title: r.name,
    description: r.bio,
    imageUrl: r.img,
    rating: r.rating,
    readMoreText: featured ? "Order from this restaurant" : undefined,
    onSelect: () => goToRestaurantMenu(r.id),
  };
}

export default function RestaurantsPage() {
  const [items, setItems] = useState<RestaurantSummary[]>([]);
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants(36).then(({ items: list, live: ok }) => {
      setItems(list);
      setLive(ok);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter(
    (r) =>
      !query.trim() ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.bio.toLowerCase().includes(query.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 md:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Browse restaurants
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Pick a place to eat — you&apos;ll sign in before ordering.{" "}
            {live ? (
              <span className="text-emerald-600">Live menus from the database.</span>
            ) : (
              <span>Start the API server to load real restaurants.</span>
            )}
          </p>
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm outline-none ring-orange-500 focus:ring-2"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading restaurants…</p>
        ) : !sorted.length ? (
          <p className="text-center text-muted-foreground">No restaurants found.</p>
        ) : (
          <>
            {featured && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mb-10"
              >
                <RestaurantCard variant="featured" {...toCardProps(featured, true)} />
              </motion.div>
            )}

            <motion.div
              className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {rest.map((r) => (
                <motion.div key={r.id} variants={itemVariants}>
                  <RestaurantCard {...toCardProps(r)} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
