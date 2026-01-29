
import { prisma } from "../src/config/prisma.config";
import * as fs from "fs";
import * as path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("Generating JMeter data...");

    const outputDir = path.join(__dirname, "../jmeter_data");
    if (!fs.existsSync(outputDir)) {
        console.log(`Creating directory: ${outputDir}`);
        fs.mkdirSync(outputDir);
    }

    // 1. Export Users (Customer role only)
    console.log("Fetching customers...");
    const customers = await prisma.user.findMany({
        where: {
            userRoles: {
                some: {
                    role: {
                        roleKey: "CUSTOMER",
                    },
                },
            },
        },
        take: 10000, // Limit to seeded amount
        select: {
            userEmail: true,
        },
    });

    const usersCsvContent = customers.map((c) => `${c.userEmail},Pass@123`).join("\n");
    fs.writeFileSync(path.join(outputDir, "users.csv"), `email,password\n${usersCsvContent}`);
    console.log(`Exported ${customers.length} users to jmeter_data/users.csv`);

    // 2. Export Restaurants
    console.log("Fetching restaurants...");
    const restaurants = await prisma.restaurant.findMany({
        take: 1000,
        select: {
            restaurantId: true,
        },
    });

    const restaurantsCsvContent = restaurants.map((r) => r.restaurantId).join("\n");
    fs.writeFileSync(
        path.join(outputDir, "restaurants.csv"),
        `restaurantId\n${restaurantsCsvContent}`
    );
    console.log(`Exported ${restaurants.length} restaurants to jmeter_data/restaurants.csv`);

    // 3. Export Menu Items
    console.log("Fetching menu items...");
    const menuItems = await prisma.menuItem.findMany({
        take: 1000,
        select: {
            menuItemId: true,
        },
    });

    const menuItemsCsvContent = menuItems.map((m) => `${m.menuItemId}`).join("\n");
    fs.writeFileSync(
        path.join(outputDir, "menu_items.csv"),
        `menuItemId\n${menuItemsCsvContent}`
    );
    console.log(`Exported ${menuItems.length} menu items to jmeter_data/menu_items.csv`);

    console.log("Done!");
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
