import { faker } from "@faker-js/faker";

import { prisma } from "../src/config/prisma.config";
import { DEFAULT_ROLE_KEYS } from "../src/utils/const";

async function main() {
  await prisma.userRole.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({
    where: { OR: [{ userEmail: "admin@admin.com" }, { userEmail: "customer@gmail.com" }] },
  });
  await prisma.customer.deleteMany({});
  await prisma.restaurant.deleteMany({});

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

  console.log(defaultRoles);

  const users = await prisma.user.createManyAndReturn({
    data: [
      {
        userName: "System Admin",
        userEmail: "admin@admin.com",
        userPassword: "123456",
      },
      {
        userName: "New Customer",
        userEmail: "customer@gmail.com",
        userPassword: "123456",
      },
    ],
    select: {
      userId: true,
      userEmail: true,
    },
  });

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

  console.log(users);

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

  console.log(customer);

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
