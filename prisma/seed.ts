import { faker } from "@faker-js/faker";

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
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.orderStatus.deleteMany({});

  const defaultRoles = await prisma.role.createManyAndReturn({
    data: [
      { roleName: "Admin", roleKey: DEFAULT_ROLE_KEYS.ADMIN },
      { roleName: "Customer", roleKey: DEFAULT_ROLE_KEYS.CUSTOMER },
      { roleName: "Restaurant Manager", roleKey: DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER },
    ],
    select: {
      roleId: true,
      roleKey: true,
    },
  });

  // console.log(defaultRoles);

  const users = await prisma.user.createManyAndReturn({
    data: [
      {
        userName: "System Admin",
        userEmail: "admin@admin.com",
        userPassword: await PasswordUtils.hash("Pass@123"),
        isAdmin: true,
        isConfirmed: true,
      },
      {
        userName: "New Customer",
        userEmail: "customer@gmail.com",
        userPassword: await PasswordUtils.hash("Pass@123"),
      },
    ],
    select: {
      userId: true,
      userEmail: true,
    },
  });

  const managerRole = defaultRoles.find(
    (role) => role.roleKey === DEFAULT_ROLE_KEYS.RESTAURANT_MANAGER
  );
  const managerRoleId = managerRole?.roleId as string;

  console.log("Seeding 10,000 restaurants and managers...");
  const startTime = performance.now();

  const BATCH_SIZE = 100;
  const TOTAL_RECORDS = 1000;

  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_RECORDS - i);

    await Promise.all(
      Array.from({ length: currentBatchSize }).map(async (_, index) => {
        const globalIndex = i + index;
        const password = await PasswordUtils.hash("Pass@123");

        await prisma.user.create({
          data: {
            userName: faker.person.fullName(),
            userEmail: `manager${globalIndex}@example.com`,
            userPassword: password,
            userRoles: {
              create: {
                roleId: managerRoleId,
              },
            },
            restaurant: {
              create: {
                restaurantName: `${faker.company.name()} ${globalIndex}`,
                restaurantBio: faker.lorem.sentence(),
                isAvailable: true,
              },
            },
          },
        });
      })
    );
  }

  const endTime = performance.now();
  console.log(`Seeding completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);

  const adminUserId = users.find((user) => user.userEmail === "admin@admin.com")?.userId as string;
  const customerUserId = users.find((user) => user.userEmail === "customer@gmail.com")
    ?.userId as string;

  await prisma.userRole.createMany({
    data: [
      {
        userId: adminUserId,
        roleId: defaultRoles.find((role) => role.roleKey === DEFAULT_ROLE_KEYS.ADMIN)
          ?.roleId as string,
      },
      {
        userId: customerUserId,
        roleId: defaultRoles.find((role) => role.roleKey === DEFAULT_ROLE_KEYS.CUSTOMER)
          ?.roleId as string,
      },
    ],
  });

  const customer = await prisma.customer.create({
    data: {
      userId: customerUserId,
      customerPhone: "1234567890",
      createdById: customerUserId,
      updatedById: customerUserId,
    },
    select: {
      customerId: true,
    },
  });

  // console.log(customer);

  const restaurant = await prisma.restaurant.create({
    data: {
      restaurantName: faker.company.name(),
      restaurantBio: faker.lorem.sentence(),
      isAvailable: true,
      manager: {
        connect: {
          userId: users.find((user) => user.userEmail === "admin@admin.com")?.userId as string,
        },
      },
    },
    select: {
      restaurantId: true,
    },
  });

  console.log(restaurant);

  // create menu
  const menuCategory = await prisma.menuCategory.create({
    data: {
      menuCategoryName: faker.lorem.sentence(),
      menuCategoryImageUrl: faker.image.url(),
      menu: {
        create: {
          menuDesc: faker.lorem.sentence(),
          restaurant: {
            connect: {
              restaurantId: restaurant.restaurantId,
            },
          },
        },
      },
    },
  });

  console.log(menuCategory);

  //add menu items records
  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_RECORDS - i);

    await Promise.all(
      Array.from({ length: currentBatchSize }).map(async (_, index) => {
        await prisma.menuItem.create({
          data: {
            menuItemName: faker.person.fullName(),
            menuItemImageUrl: faker.image.url(),
            price: faker.number.int({ min: 1, max: 100 }),
            stockQuantity: faker.number.int({ min: 10, max: 100 }),
            menuItemDesc: faker.lorem.sentence(),
            isActive: true,
            menuCategory: {
              connect: {
                menuCategoryId: menuCategory.menuCategoryId,
              },
            },
          },
        });
      })
    );
  }
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
