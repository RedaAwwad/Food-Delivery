import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // --- Roles ---
  const roles = await prisma.role.createMany({
    data: [
      { name: 'admin', description: 'Platform administrator' },
      { name: 'customer', description: 'Regular customer' },
      { name: 'restaurant_manager', description: 'Restaurant manager' },
    ],
    skipDuplicates: true,
  })

  // --- Users ---

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: '111111111',
    },
  })

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'John Customer',
      email: 'customer@example.com',
      password: '111111111',
    },
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Jane Manager',
      email: 'manager@example.com',
      password: '111111111',
    },
  })

  // --- Assign Roles ---
  const [adminRole, customerRole, managerRole] = await Promise.all([
    prisma.role.findFirst({ where: { name: 'admin' } }),
    prisma.role.findFirst({ where: { name: 'customer' } }),
    prisma.role.findFirst({ where: { name: 'restaurant_manager' } }),
  ])

  await prisma.userRole.createMany({
    data: [
      { userId: admin.id, roleId: adminRole!.id },
      { userId: customerUser.id, roleId: customerRole!.id },
      { userId: managerUser.id, roleId: managerRole!.id },
    ],
    skipDuplicates: true,
  })

  // --- Customer ---
  const customer = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      phone: '+201000000000',
      avatar: 'https://i.pravatar.cc/150?u=customer',
    },
  })

  // --- Restaurant ---
  const restaurant = await prisma.restaurant.upsert({
    where: { managerId: managerUser.id },
    update: {},
    create: {
      managerId: managerUser.id,
      name: 'Good Eats Restaurant',
      description: 'Tasty meals every day!',
      logo: 'https://via.placeholder.com/150',
      address: '123 Food Street, Cairo',
      isAvailable: true,
    },
  })

  // --- Menu ---
  const menu = await prisma.menu.upsert({
    where: { restaurantId: restaurant.id },
    update: {},
    create: {
      restaurantId: restaurant.id,
      menuDescription: 'Main menu of the restaurant',
      isActive: true,
    },
  })

  // --- Menu Category ---
  const category = await prisma.menuCategory.create({
    data: {
      menuId: menu.id,
      name: 'Burgers',
      menuCategoryImageUrl: 'https://via.placeholder.com/100',
    },
  })

  // --- Menu Items ---
  await prisma.menuItem.createMany({
    data: [
      {
        menuCategoryId: category.id,
        name: 'Classic Burger',
        description: 'Juicy beef burger with cheese and lettuce',
        imageUrl: 'https://via.placeholder.com/120',
        price: 80,
        stockQuantity: 20,
      },
      {
        menuCategoryId: category.id,
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with mayo and pickles',
        imageUrl: 'https://via.placeholder.com/120',
        price: 70,
        stockQuantity: 15,
      },
    ],
  })

  // --- Customer Cart ---
  const cart = await prisma.cart.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id },
  })

  const menuItems = await prisma.menuItem.findMany()

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: cart.id,
        menuItemId: menuItems[0].id,
        quantity: 2,
        price: menuItems[0].price,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .then()