import { faker } from "@faker-js/faker";

import { prisma } from "../src/config/prisma.config";
import { DEFAULT_ROLE_KEYS } from "../src/utils/constants";
import { PasswordUtils } from "../src/utils/password.utils";

async function main() {
  // await prisma.userRole.deleteMany({});
  // await prisma.role.deleteMany({});
  // await prisma.userRole.deleteMany({});
  // await prisma.userToken.deleteMany({});
  // await prisma.customer.deleteMany({});
  // await prisma.user.deleteMany({});
  // await prisma.restaurant.deleteMany({});

  console.log("Seeding started...");

  // 1. Ensure Roles exist (Idempotent)
  const roleKeys = [
    { name: "Admin", key: DEFAULT_ROLE_KEYS.ADMIN },
    { name: "Customer", key: DEFAULT_ROLE_KEYS.CUSTOMER },
    { name: "Restaurant Manager", key: DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER },
  ];

  const rolesMap = new Map<string, string>(); // Key -> ID

  for (const r of roleKeys) {
    let role = await prisma.role.findUnique({ where: { roleKey: r.key } });
    if (!role) {
      role = await prisma.role.create({
        data: { roleName: r.name, roleKey: r.key },
      });
    }
    rolesMap.set(r.key, role.roleId);
    rolesMap.set(r.key, role.roleId);
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
    userPassword: "Pass@123", // In a real scenario, hash this. For speed in seed, maybe skip hashing or hash once.
  }));

  // Hash password once for performance
  const hashedPwd = await PasswordUtils.hash("Pass@123");
  restaurantManagersData.forEach(m => m.userPassword = hashedPwd);

  const createdManagers = await prisma.$transaction(
    chunk(restaurantManagersData, 100).map((batch) =>
      prisma.user.createManyAndReturn({ data: batch })
    )
  ).then(res => res.flat());

  // Assign Manager Role
  const managerRoleId = rolesMap.get(DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER)!;
  await prisma.userRole.createMany({
    data: createdManagers.map((m) => ({ userId: m.userId, roleId: managerRoleId })),
  });

  // Create Restaurants
  const validManagerIds = createdManagers.map(m => m.userId);
  const restaurantsData = validManagerIds.map((managerId) => ({
    managerId,
    restaurantName: faker.company.name() + " " + faker.word.noun(),
    restaurantBio: faker.lorem.sentence(),
    isAvailable: true,
  }));

  const createdRestaurants = await prisma.$transaction(
    chunk(restaurantsData, 100).map((batch) =>
      prisma.restaurant.createManyAndReturn({ data: batch })
    )
  ).then(res => res.flat());

  // Create Menus (1 per restaurant)
  const menusData = createdRestaurants.map((r) => ({
    restaurantId: r.restaurantId,
    menuDesc: "Standard Menu",
  }));

  const createdMenus = await prisma.$transaction(
    chunk(menusData, 100).map((batch) =>
      prisma.menu.createManyAndReturn({ data: batch })
    )
  ).then(res => res.flat());

  // Create Menu Categories (1 per Menu)
  const categoriesData = createdMenus.map(m => ({
    menuId: m.menuId,
    menuCategoryName: "Main Course", // Simple default
    menuCategoryImageUrl: faker.image.urlLoremFlickr({ category: 'food' }),
  }));

  const createdCategories = await prisma.$transaction(
    chunk(categoriesData, 100).map(batch =>
      prisma.menuCategory.createManyAndReturn({ data: batch })
    )
  ).then(res => res.flat());


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

  await prisma.$transaction(
    chunk(menuItemsData, 500).map((batch) =>
      prisma.menuItem.createMany({ data: batch })
    )
  );

  console.log(`Created ${NUM_RESTAURANTS} restaurants and ~${NUM_RESTAURANTS * MENU_ITEMS_PER_RESTAURANT} items.`);


  // --- SEED CUSTOMERS (10,000) ---
  console.log("Seeding Customers...");
  const NUM_CUSTOMERS = 10000;

  const costumersData = Array.from({ length: NUM_CUSTOMERS }).map(() => ({
    userName: faker.person.fullName(),
    userEmail: faker.internet.email(), // Potentially duplicates, but low chance with faker + large range
    userPassword: hashedPwd,
    isConfirmed: true,
  }));

  const createdUserCustomers = await prisma.$transaction(
    chunk(costumersData, 100).map((batch) =>
      prisma.user.createManyAndReturn({ data: batch, skipDuplicates: true }) // Skip if email collides
    )
  ).then(res => res.flat());


  const customerRoleId = rolesMap.get(DEFAULT_ROLE_KEYS.CUSTOMER)!;
  await prisma.userRole.createMany({
    data: createdUserCustomers.map((u) => ({ userId: u.userId, roleId: customerRoleId })),
  });

  const customerProfilesData = createdUserCustomers.map((u) => ({
    userId: u.userId,
    customerPhone: faker.phone.number(),
    createdById: u.userId,
    updatedById: u.userId,
  }));

  const createdCustomers = await prisma.$transaction(
    chunk(customerProfilesData, 100).map(batch =>
      prisma.customer.createManyAndReturn({ data: batch })
    )
  ).then(res => res.flat());


  // --- SEED CARTS & CART ITEMS ---
  console.log("Seeding Carts...");

  // Fetch all menu items ids to pick randomly
  const allMenuItemIds = await prisma.menuItem.findMany({ select: { menuItemId: true, price: true } });

  const cartsData = createdCustomers.map(c => ({
    customerId: c.customerId
  }));

  const createdCarts = await prisma.$transaction(
    chunk(cartsData, 100).map(batch =>
      prisma.cart.createManyAndReturn({ data: batch })
    )
  ).then(res => res.flat());

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

  await prisma.$transaction(
    chunk(cartItemsData, 500).map(batch =>
      prisma.cartItem.createMany({ data: batch, skipDuplicates: true })
    )
  );

  console.log(`Seeding complete! Created ${createdUserCustomers.length} customers and ${createdCarts.length} carts.`);

  // const users = prisma.user.createManyAndReturn({
  //   data: Array.from({ length: 10 }).map(() => ({
  //     name: faker.person.fullName(),
  //     email: faker.internet.email(),
  //     password: faker.internet.password(),
  //   })),
  // });
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
