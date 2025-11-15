import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  const users = prisma.user.createManyAndReturn({
    data: Array.from({ length: 10 }).map(() => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })),
  });
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
