// Rich demo data so every screen is high-fidelity even without a populated DB.
const FOOD_IMG = {
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  sushi: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80",
  pasta: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  dessert: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
  steak: "https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&q=80",
  ramen: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
  tacos: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80",
  wings: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&q=80",
  pancake: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
};
const MAP_IMG = (q) => `https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&q=70`;

const names = ["Olivia Bennett","Liam Carter","Sophia Nguyen","Noah Williams","Emma Garcia","Mason Lee","Ava Patel","Lucas Brown","Mia Rossi","Ethan Kim","Isabella Cruz","James Cooper","Amelia Khan","Benjamin Wright","Charlotte Diaz"];
const avatar = (n) => `https://i.pravatar.cc/100?u=${encodeURIComponent(n)}`;

export const MOCK = {
  stats: {
    orders: { value: 18429, delta: 12.5, series: [120,132,128,155,149,172,168,190,205,198,221,243] },
    revenue: { value: 284910, delta: 8.2, series: [12,18,15,22,26,24,30,28,35,33,40,44] },
    branches: { value: 12, delta: 2, active: 10 },
    customers: { value: 9241, delta: 18.7, series: [40,52,58,63,71,82,90,101,118,132,151,176] },
  },
  revenueChart: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    revenue: [42,48,46,58,64,61,72,78,86,82,94,103],
    orders: [12,14,13,17,19,18,22,24,27,25,29,33],
  },
  customerGrowth: {
    labels: ["W1","W2","W3","W4","W5","W6","W7","W8"],
    newC: [120,180,150,220,260,310,290,360],
    returning: [80,120,140,160,200,230,260,300],
  },
  channelSplit: [
    { label: "Dine-in", value: 42, color: "#ff5a1f" },
    { label: "Delivery", value: 33, color: "#6d5efc" },
    { label: "Takeaway", value: 18, color: "#16a34a" },
    { label: "QR Order", value: 7, color: "#2563eb" },
  ],
  popularMeals: [
    { name: "Truffle Smash Burger", cat: "Burgers", price: 18, sold: 1240, img: FOOD_IMG.burger, rating: 4.9 },
    { name: "Margherita Napoli", cat: "Pizza", price: 16, sold: 1112, img: FOOD_IMG.pizza, rating: 4.8 },
    { name: "Dragon Sushi Set", cat: "Japanese", price: 28, sold: 980, img: FOOD_IMG.sushi, rating: 4.9 },
    { name: "Tonkotsu Ramen", cat: "Japanese", price: 19, sold: 870, img: FOOD_IMG.ramen, rating: 4.7 },
    { name: "Wagyu Ribeye", cat: "Grill", price: 46, sold: 612, img: FOOD_IMG.steak, rating: 5.0 },
  ],
  notifications: [
    { type: "order", title: "New order #ORD-7782", time: "2 min ago", icon: "cart", tint: "tint-brand" },
    { type: "review", title: "Olivia left a 5-star review", time: "18 min ago", icon: "star", tint: "tint-amber" },
    { type: "stock", title: "Low stock: Wagyu Ribeye", time: "40 min ago", icon: "fire", tint: "tint-amber" },
    { type: "branch", title: "Downtown branch is now open", time: "1 hr ago", icon: "store", tint: "tint-green" },
    { type: "payment", title: "Payout of $4,210 processed", time: "3 hrs ago", icon: "dollar", tint: "tint-violet" },
  ],
  branches: [
    { id: "BR-01", name: "FoodHub Downtown", city: "New York, NY", status: "open", orders: 3421, revenue: 84200, rating: 4.8, staff: 24, manager: "Liam Carter", capacity: 86, img: MAP_IMG() },
    { id: "BR-02", name: "FoodHub Riverside", city: "Brooklyn, NY", status: "open", orders: 2890, revenue: 71500, rating: 4.7, staff: 19, manager: "Sophia Nguyen", capacity: 72, img: MAP_IMG() },
    { id: "BR-03", name: "FoodHub Midtown", city: "Manhattan, NY", status: "open", orders: 4102, revenue: 98700, rating: 4.9, staff: 31, manager: "Noah Williams", capacity: 91, img: MAP_IMG() },
    { id: "BR-04", name: "FoodHub Harbor", city: "Jersey City, NJ", status: "closed", orders: 1640, revenue: 39800, rating: 4.5, staff: 14, manager: "Emma Garcia", capacity: 40, img: MAP_IMG() },
    { id: "BR-05", name: "FoodHub Uptown", city: "Bronx, NY", status: "open", orders: 2210, revenue: 52300, rating: 4.6, staff: 17, manager: "Mason Lee", capacity: 65, img: MAP_IMG() },
    { id: "BR-06", name: "FoodHub Queens", city: "Queens, NY", status: "open", orders: 1980, revenue: 47100, rating: 4.6, staff: 16, manager: "Ava Patel", capacity: 58, img: MAP_IMG() },
  ],
  categories: [
    { name: "Burgers", count: 14, icon: "burger" },
    { name: "Pizza", count: 11, icon: "pizza" },
    { name: "Japanese", count: 18, icon: "sushi" },
    { name: "Pasta", count: 9, icon: "pasta" },
    { name: "Salads", count: 7, icon: "salad" },
    { name: "Desserts", count: 12, icon: "dessert" },
  ],
  menuItems: [
    { name: "Truffle Smash Burger", cat: "Burgers", price: 18, status: "available", img: FOOD_IMG.burger, desc: "Double smash patty, truffle aioli, aged cheddar.", rating: 4.9, stock: 40 },
    { name: "Margherita Napoli", cat: "Pizza", price: 16, status: "available", img: FOOD_IMG.pizza, desc: "San Marzano tomato, fresh mozzarella, basil.", rating: 4.8, stock: 35 },
    { name: "Dragon Sushi Set", cat: "Japanese", price: 28, status: "available", img: FOOD_IMG.sushi, desc: "12-piece chef selection with eel & avocado.", rating: 4.9, stock: 22 },
    { name: "Creamy Carbonara", cat: "Pasta", price: 17, status: "available", img: FOOD_IMG.pasta, desc: "Guanciale, pecorino, free-range egg yolk.", rating: 4.7, stock: 28 },
    { name: "Garden Caesar", cat: "Salads", price: 12, status: "available", img: FOOD_IMG.salad, desc: "Cos lettuce, parmesan crisps, anchovy dressing.", rating: 4.5, stock: 50 },
    { name: "Molten Lava Cake", cat: "Desserts", price: 9, status: "available", img: FOOD_IMG.dessert, desc: "Warm chocolate center, vanilla bean gelato.", rating: 4.9, stock: 18 },
    { name: "Wagyu Ribeye", cat: "Grill", price: 46, status: "soldout", img: FOOD_IMG.steak, desc: "A5 grade, chimichurri, truffle butter.", rating: 5.0, stock: 0 },
    { name: "Tonkotsu Ramen", cat: "Japanese", price: 19, status: "available", img: FOOD_IMG.ramen, desc: "18-hour pork broth, chashu, ajitama egg.", rating: 4.7, stock: 30 },
    { name: "Street Tacos x3", cat: "Mexican", price: 14, status: "available", img: FOOD_IMG.tacos, desc: "Carne asada, pico de gallo, lime crema.", rating: 4.6, stock: 44 },
    { name: "Buffalo Wings", cat: "Starters", price: 13, status: "available", img: FOOD_IMG.wings, desc: "Crispy wings tossed in house buffalo sauce.", rating: 4.7, stock: 60 },
    { name: "Cold Brew Latte", cat: "Drinks", price: 6, status: "available", img: FOOD_IMG.coffee, desc: "Slow-steeped 16h cold brew, oat milk.", rating: 4.8, stock: 80 },
    { name: "Fluffy Pancakes", cat: "Breakfast", price: 11, status: "available", img: FOOD_IMG.pancake, desc: "Buttermilk stack, maple syrup, berries.", rating: 4.6, stock: 25 },
  ],
  orders: buildOrders(),
  staff: [
    { name: "Liam Carter", role: "Branch Manager", branch: "Downtown", status: "active", attendance: 98, perf: 94, shift: "Morning", avatar: avatar("Liam Carter") },
    { name: "Sophia Nguyen", role: "Head Chef", branch: "Riverside", status: "active", attendance: 96, perf: 97, shift: "Evening", avatar: avatar("Sophia Nguyen") },
    { name: "Noah Williams", role: "Sous Chef", branch: "Midtown", status: "active", attendance: 91, perf: 88, shift: "Morning", avatar: avatar("Noah Williams") },
    { name: "Emma Garcia", role: "Cashier", branch: "Harbor", status: "leave", attendance: 84, perf: 79, shift: "Evening", avatar: avatar("Emma Garcia") },
    { name: "Mason Lee", role: "Waiter", branch: "Uptown", status: "active", attendance: 93, perf: 85, shift: "Night", avatar: avatar("Mason Lee") },
    { name: "Ava Patel", role: "Delivery Lead", branch: "Queens", status: "active", attendance: 95, perf: 90, shift: "Morning", avatar: avatar("Ava Patel") },
    { name: "Lucas Brown", role: "Barista", branch: "Downtown", status: "offline", attendance: 88, perf: 82, shift: "Evening", avatar: avatar("Lucas Brown") },
  ],
  customers: buildCustomers(),
  bestSellers: [
    { name: "Truffle Smash Burger", sold: 1240, revenue: 22320 },
    { name: "Margherita Napoli", sold: 1112, revenue: 17792 },
    { name: "Dragon Sushi Set", sold: 980, revenue: 27440 },
    { name: "Tonkotsu Ramen", sold: 870, revenue: 16530 },
    { name: "Creamy Carbonara", sold: 760, revenue: 12920 },
  ],
  IMG: FOOD_IMG,
  AVATAR: avatar,
};

function buildOrders() {
  const statuses = ["pending","preparing","ready","delivering","completed","canceled"];
  const items = ["Truffle Smash Burger","Margherita Napoli","Dragon Sushi Set","Tonkotsu Ramen","Creamy Carbonara","Buffalo Wings","Street Tacos x3","Cold Brew Latte"];
  const branches = ["Downtown","Midtown","Riverside","Uptown","Queens"];
  const out = [];
  for (let i = 0; i < 28; i++) {
    const st = statuses[i % statuses.length];
    const name = names[i % names.length];
    const n = 1 + (i % 4);
    const its = [];
    for (let j = 0; j < n; j++) its.push({ name: items[(i + j) % items.length], qty: 1 + ((i + j) % 3) });
    const total = its.reduce((s, it) => s + it.qty * (10 + (it.name.length % 30)), 0);
    out.push({
      id: `ORD-${7800 - i}`,
      customer: name,
      avatar: avatar(name),
      branch: branches[i % branches.length],
      items: its,
      total,
      status: st,
      channel: ["Dine-in","Delivery","Takeaway","QR Order"][i % 4],
      payment: ["Card","Cash","Stripe","PayPal"][i % 4],
      time: `${(i % 12) + 1}:${(i * 7 % 60).toString().padStart(2,"0")} ${i % 2 ? "PM" : "AM"}`,
      mins: i * 3 + 2,
    });
  }
  return out;
}
function buildCustomers() {
  return names.map((n, i) => ({
    name: n,
    email: n.toLowerCase().replace(/[^a-z]/g, ".") + "@email.com",
    phone: `+1 (212) 555-${(1000 + i * 37).toString().slice(0,4)}`,
    avatar: avatar(n),
    orders: 4 + (i * 7 % 60),
    spent: 120 + (i * 137 % 4000),
    loyalty: 80 + (i * 53 % 2000),
    tier: ["Bronze","Silver","Gold","Platinum"][i % 4],
    status: i % 5 === 0 ? "inactive" : "active",
    joined: `202${3 + (i % 3)}`,
    last: `${(i % 28) + 1} days ago`,
  }));
}
