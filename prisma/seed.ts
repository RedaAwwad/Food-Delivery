import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import { prisma } from "../src/config/prisma.config";
import { DEFAULT_ROLE_KEYS } from "../src/utils/constants";
import { PasswordUtils } from "../src/utils/password.utils";

async function main() {
  console.log("Cleaning up database...");
  // Ordered cleanup to avoid foreign key constraint violations
  await prisma.orderItem.deleteMany({});
  await prisma.orderTracking.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.menuCategory.deleteMany({});
  await prisma.menu.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.userToken.deleteMany({});
  // await prisma.userRole.deleteMany({}); // Removed
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.orderStatus.deleteMany({});

  console.log("Seeding started...");

  // 1. Ensure Roles exist (Idempotent) - Still keeping Role table for definitions
  const roleKeys = [
    { name: "Admin", key: DEFAULT_ROLE_KEYS.ADMIN },
    { name: "Customer", key: DEFAULT_ROLE_KEYS.CUSTOMER },
    { name: "Restaurant Manager", key: DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER },
  ];

  for (const r of roleKeys) {
    let role = await prisma.role.findUnique({ where: { roleKey: r.key } });
    if (!role) {
      await prisma.role.create({
        data: { roleName: r.name, roleKey: r.key },
      });
    }
  }

  // 1.1 Ensure Order Statuses exist
  const orderStatuses = ["PENDING", "COMPLETED", "CANCELED"];
  for (const status of orderStatuses) {
    const existingStatus = await prisma.orderStatus.findUnique({
      where: { orderStatusKey: status as any },
    });
    if (!existingStatus) {
      await prisma.orderStatus.create({
        data: {
          orderStatusKey: status as any,
          orderStatusName: status.replace(/_/g, " ").toLowerCase(),
        },
      });
    }
  }

  // 1.2 Create Default Admin User
  console.log("Seeding Default Admin...");
  const adminEmail = "admin@admin.com";
  const adminPassword = await PasswordUtils.hash("Pass@123");

  const existingAdmin = await prisma.user.findUnique({ where: { userEmail: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        userName: "Super Admin",
        userEmail: adminEmail,
        userPassword: adminPassword,
        isAdmin: true,
        isConfirmed: true,
        isActive: true,
        roles: [DEFAULT_ROLE_KEYS.ADMIN], // JSONB Roles
      },
    });
    console.log("Default Admin created.");
  } else {
    console.log("Default Admin already exists.");
  }

  // Helper to chunk arrays
  const chunk = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
      arr.slice(i * size, i * size + size)
    );

  // --- SEED RESTAURANTS (1000) ---
  console.log("Seeding Restaurants...");
  const NUM_RESTAURANTS = 1000;
  const MENU_ITEMS_PER_RESTAURANT = 20;

  // Create Managers first
  const restaurantManagersData = Array.from({ length: NUM_RESTAURANTS }).map(() => ({
    userName: faker.person.fullName(),
    userEmail: faker.internet.email(),
    userPassword: "Pass@123",
    roles: [DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER], // JSONB Roles
    isActive: true,
    isConfirmed: true,
  }));

  // Hash password once for performance
  const hashedPwd = await PasswordUtils.hash("Pass@123");
  restaurantManagersData.forEach(m => m.userPassword = hashedPwd);

  const createdManagers = await prisma.$transaction(async (tx) => {
    const batches = chunk(restaurantManagersData, 100).map((batch) =>
      tx.user.createManyAndReturn({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());


  // Create Restaurants
  const validManagerIds = createdManagers.map(m => m.userId);
  const restaurantsData = validManagerIds.map((managerId) => {
    // Generate Address for Restaurant
    const address = {
      addressId: uuidv7(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      area: faker.location.state(), // approximating area
      zipCode: faker.location.zipCode(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      managerId,
      restaurantName: faker.company.name() + " " + faker.word.noun(),
      restaurantBio: faker.lorem.sentence(),
      isAvailable: true,
      addresses: [address], // JSONB Addresses
    };
  });

  const createdRestaurants = await prisma.$transaction(async (tx) => {
    const batches = chunk(restaurantsData, 100).map((batch) =>
      tx.restaurant.createManyAndReturn({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());

  // Create Menus (1 per restaurant)
  const menusData = createdRestaurants.map((r) => ({
    restaurantId: r.restaurantId,
    menuDesc: "Standard Menu",
  }));

  const createdMenus = await prisma.$transaction(async (tx) => {
    const batches = chunk(menusData, 100).map((batch) =>
      tx.menu.createManyAndReturn({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());

  // Create Menu Categories (1 per Menu)
  const categoriesData = createdMenus.map(m => ({
    menuId: m.menuId,
    menuCategoryName: "Main Course", // Simple default
    menuCategoryImageUrl: faker.image.urlLoremFlickr({ category: 'food' }),
  }));

  const createdCategories = await prisma.$transaction(async (tx) => {
    const batches = chunk(categoriesData, 100).map(batch =>
      tx.menuCategory.createManyAndReturn({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());


  // Create Menu Items
  const menuItemsData = createdCategories.flatMap((cat) =>
    Array.from({ length: MENU_ITEMS_PER_RESTAURANT }).map(() => ({
      menuCategoryId: cat.menuCategoryId,
      menuItemName: faker.food.dish(),
      menuItemDesc: faker.food.description(),
      menuItemImageUrl: faker.image.urlLoremFlickr({ category: 'food' }),
      price: parseInt(faker.commerce.price({ min: 10, max: 100, dec: 0 })), // Integer price
      stockQuantity: 100,
    }))
  );

  await prisma.$transaction(async (tx) => {
    const batches = chunk(menuItemsData, 500).map((batch) =>
      tx.menuItem.createMany({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 });

  console.log(`Created ${NUM_RESTAURANTS} restaurants and ~${NUM_RESTAURANTS * MENU_ITEMS_PER_RESTAURANT} items.`);


  // --- SEED CUSTOMERS (10,000) ---
  console.log("Seeding Customers...");
  const NUM_CUSTOMERS = 10000;

  const costumersData = Array.from({ length: NUM_CUSTOMERS }).map(() => ({
    userName: faker.person.fullName(),
    userEmail: faker.internet.email(), // Potentially duplicates, but low chance with faker + large range
    userPassword: hashedPwd,
    isConfirmed: true,
    isActive: true,
    roles: [DEFAULT_ROLE_KEYS.CUSTOMER], // JSONB Roles
  }));

  const createdUserCustomers = await prisma.$transaction(async (tx) => {
    const batches = chunk(costumersData, 100).map((batch) =>
      tx.user.createManyAndReturn({ data: batch, skipDuplicates: true }) // Skip if email collides
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());


  const customerProfilesData = createdUserCustomers.map((u) => {
    // Generate Address for Customer
    const address = {
      addressId: uuidv7(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      area: faker.location.state(),
      zipCode: faker.location.zipCode(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      userId: u.userId,
      customerPhone: faker.phone.number(),
      createdById: u.userId,
      updatedById: u.userId,
      addresses: [address], // JSONB Addresses
    };
  });

  const createdCustomers = await prisma.$transaction(async (tx) => {
    const batches = chunk(customerProfilesData, 100).map(batch =>
      tx.customer.createManyAndReturn({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());


  // --- SEED CARTS & CART ITEMS ---
  console.log("Seeding Carts...");

  // Fetch all menu items ids to pick randomly
  const allMenuItemIds = await prisma.menuItem.findMany({ select: { menuItemId: true, price: true } });

  const cartsData = createdCustomers.map(c => ({
    customerId: c.customerId
  }));

  const createdCarts = await prisma.$transaction(async (tx) => {
    const batches = chunk(cartsData, 100).map(batch =>
      tx.cart.createManyAndReturn({ data: batch })
    );
    return Promise.all(batches);
  }, { timeout: 60000 }).then(res => res.flat());

  const cartItemsData: any[] = [];

  createdCarts.forEach(cart => {
    const numItems = faker.number.int({ min: 1, max: 3 });

    // Pick random items
    for (let i = 0; i < numItems; i++) {
      const randomItem = allMenuItemIds[Math.floor(Math.random() * allMenuItemIds.length)];
      if (!randomItem) continue; // Skip if undefined (should not happen)
      cartItemsData.push({
        cartId: cart.cartId,
        menuItemId: randomItem!.menuItemId,
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: randomItem!.price
      });
    }
  });

  await prisma.$transaction(async (tx) => {
    const batches = chunk(cartItemsData, 500).map(batch =>
      tx.cartItem.createMany({ data: batch, skipDuplicates: true })
    );
    return Promise.all(batches);
  }, { timeout: 60000 });

  console.log(`Seeding complete! Created ${createdUserCustomers.length} customers and ${createdCarts.length} carts.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
