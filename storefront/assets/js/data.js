// Demo catalogue so the storefront is always rich; API data merges over this.
const P = "&q=85&auto=format&fit=crop";
const IMG = {
  burger:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" + P,
  burger2:"https://images.unsplash.com/photo-1550547660-d9450f859349?w=800" + P,
  pizza:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" + P,
  pizza2:"https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800" + P,
  sushi:"https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800" + P,
  ramen:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800" + P,
  pasta:"https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800" + P,
  salad:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" + P,
  dessert:"https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800" + P,
  steak:"https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800" + P,
  tacos:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" + P,
  coffee:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" + P,
  wings:"https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800" + P,
  pancake:"https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800" + P,
  poke:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" + P,
  smoothie:"https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800" + P,
  curry:"https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=800" + P,
};
const RIMG = {
  a:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900" + P,
  b:"https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900" + P,
  c:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900" + P,
  d:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900" + P,
  e:"https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=900" + P,
  f:"https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=900" + P,
  g:"https://images.unsplash.com/photo-1576867757603-05b134ebc379?w=900" + P,
  h:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900" + P,
};

export const CATEGORIES = [
  { name:"Burgers", img:IMG.burger2, count:128 },
  { name:"Pizza", img:IMG.pizza, count:96 },
  { name:"Sushi", img:IMG.sushi, count:74 },
  { name:"Pasta", img:IMG.pasta, count:61 },
  { name:"Healthy", img:IMG.salad, count:88 },
  { name:"Desserts", img:IMG.dessert, count:103 },
  { name:"Grill", img:IMG.steak, count:52 },
  { name:"Drinks", img:IMG.smoothie, count:140 },
];

function meal(id, name, desc, price, img, cat, opts) {
  return { id, name, desc, price, img, cat, rating:(4.3 + (id % 7) / 10).toFixed(1), sold: 120 + id * 37 % 900, popular: id % 3 === 0, veg: id % 4 === 0, options: opts || defaultOpts() };
}
function defaultOpts() {
  return {
    size: [{ n: "Regular", p: 0 }, { n: "Large", p: 3 }, { n: "Family", p: 7 }],
    extras: [{ n: "Extra cheese", p: 1.5 }, { n: "Bacon", p: 2 }, { n: "Avocado", p: 2.5 }, { n: "Spicy sauce", p: 0.5 }],
  };
}

export const MEALS = [
  meal(1, "Truffle Smash Burger", "Double smash patty, truffle aioli, aged cheddar, brioche bun.", 18, IMG.burger, "Burgers"),
  meal(2, "Classic Cheeseburger", "Angus beef, american cheese, pickles, house sauce.", 12, IMG.burger2, "Burgers"),
  meal(3, "Margherita Napoli", "San Marzano tomato, fresh mozzarella, basil, olive oil.", 16, IMG.pizza, "Pizza"),
  meal(4, "Pepperoni Supreme", "Loaded pepperoni, mozzarella, oregano, spicy honey.", 19, IMG.pizza2, "Pizza"),
  meal(5, "Dragon Sushi Set", "12-piece chef selection with eel, salmon & avocado.", 28, IMG.sushi, "Sushi"),
  meal(6, "Tonkotsu Ramen", "18-hour pork broth, chashu, ajitama egg, scallions.", 17, IMG.ramen, "Sushi"),
  meal(7, "Creamy Carbonara", "Guanciale, pecorino, free-range egg yolk, black pepper.", 17, IMG.pasta, "Pasta"),
  meal(8, "Garden Power Bowl", "Quinoa, avocado, chickpeas, kale, tahini dressing.", 14, IMG.salad, "Healthy"),
  meal(9, "Molten Lava Cake", "Warm chocolate center, vanilla bean gelato, berries.", 9, IMG.dessert, "Desserts"),
  meal(10, "Wagyu Ribeye", "A5 grade ribeye, chimichurri, truffle butter, fries.", 46, IMG.steak, "Grill"),
  meal(11, "Street Tacos x3", "Carne asada, pico de gallo, lime crema, cilantro.", 14, IMG.tacos, "Grill"),
  meal(12, "Buffalo Wings", "Crispy wings tossed in house buffalo, blue cheese dip.", 13, IMG.wings, "Burgers"),
  meal(13, "Salmon Poke Bowl", "Fresh salmon, sushi rice, edamame, mango, sesame.", 16, IMG.poke, "Healthy"),
  meal(14, "Berry Smoothie", "Strawberry, blueberry, banana, almond milk, honey.", 7, IMG.smoothie, "Drinks"),
  meal(15, "Butter Chicken", "Tender chicken in spiced tomato cream, naan & rice.", 18, IMG.curry, "Grill"),
  meal(16, "Cold Brew Latte", "Slow-steeped 16h cold brew, oat milk, vanilla.", 6, IMG.coffee, "Drinks"),
  meal(17, "Fluffy Pancakes", "Buttermilk stack, maple syrup, fresh berries, butter.", 11, IMG.pancake, "Desserts"),
];

export const RESTAURANTS = [
  { id:"r1", name:"Smash & Co.", img:RIMG.b, cuisines:["Burgers","American"], rating:4.8, reviews:2410, eta:"20-30 min", fee:0, distance:"1.2 km", price:"$$", promo:"Free delivery", featured:true },
  { id:"r2", name:"Napoli Wood Fire", img:RIMG.c, cuisines:["Pizza","Italian"], rating:4.7, reviews:1980, eta:"25-35 min", fee:1.99, distance:"2.0 km", price:"$$", promo:"20% OFF", featured:true },
  { id:"r3", name:"Sakura Sushi House", img:RIMG.g, cuisines:["Sushi","Japanese"], rating:4.9, reviews:3120, eta:"30-40 min", fee:2.49, distance:"2.8 km", price:"$$$", promo:"", featured:true },
  { id:"r4", name:"Verde Healthy Kitchen", img:RIMG.d, cuisines:["Healthy","Salads","Vegan"], rating:4.6, reviews:1240, eta:"15-25 min", fee:0, distance:"0.9 km", price:"$$", promo:"Free delivery", featured:false },
  { id:"r5", name:"El Fuego Grill", img:RIMG.f, cuisines:["Grill","Mexican"], rating:4.7, reviews:1650, eta:"25-35 min", fee:1.49, distance:"3.1 km", price:"$$", promo:"Buy 1 Get 1", featured:false },
  { id:"r6", name:"Sweet Lab Desserts", img:RIMG.h, cuisines:["Desserts","Bakery"], rating:4.8, reviews:980, eta:"20-30 min", fee:1.99, distance:"1.6 km", price:"$", promo:"", featured:false },
  { id:"r7", name:"Pasta Amore", img:RIMG.e, cuisines:["Pasta","Italian"], rating:4.5, reviews:870, eta:"30-40 min", fee:2.49, distance:"3.6 km", price:"$$", promo:"15% OFF", featured:false },
  { id:"r8", name:"Bowl & Roll", img:RIMG.a, cuisines:["Healthy","Poke","Asian"], rating:4.6, reviews:1110, eta:"20-30 min", fee:0, distance:"1.1 km", price:"$$", promo:"Free delivery", featured:false },
];

// map each restaurant to a menu (reuse meals, vary)
export function menuFor(rid) {
  const seed = rid.charCodeAt(1) || 1;
  return MEALS.map((m, i) => ({ ...m, id: `${rid}-${m.id}`, price: Math.max(5, m.price + ((seed + i) % 5 - 2)) }));
}

export const REVIEWS = [
  { name:"Olivia B.", avatar:"https://i.pravatar.cc/80?u=olivia", rating:5, text:"Fastest delivery I've ever had — food arrived hot and the packaging was beautiful. My go-to app now!" },
  { name:"Marcus T.", avatar:"https://i.pravatar.cc/80?u=marcus", rating:5, text:"The AI recommendations are scary good. Discovered my new favorite ramen spot thanks to it." },
  { name:"Aisha K.", avatar:"https://i.pravatar.cc/80?u=aisha", rating:4, text:"Love the live tracking, I always know exactly when my order is arriving. Clean and easy to use." },
];

export const OFFERS = [
  { title:"50% OFF first order", sub:"Use code WELCOME50", bg:"linear-gradient(135deg,#ff6a1a,#ef5106)", em:"🎉" },
  { title:"Free delivery week", sub:"On orders over $20", bg:"linear-gradient(135deg,#0fae6e,#0c925c)", em:"🚲" },
  { title:"Dessert on us", sub:"Add any 2 mains", bg:"linear-gradient(135deg,#7b5bff,#5a3df0)", em:"🍰" },
];

export const IMAGES = IMG;
