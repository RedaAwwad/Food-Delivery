
import { prisma } from "../config/prisma.config";

const CUSTOMER_ID = "019b6c3f-24bc-7092-ae78-0088aaaf4b02";

async function checkLock() {
    console.log("Checking lock for customer:", CUSTOMER_ID);

    try {
        const start = Date.now();
        console.log("Attempting to update cart...");

        // Attempt a simple update. 
        // If the row is locked, this will hang.
        const cart = await prisma.cart.update({
            where: { customerId: CUSTOMER_ID },
            data: { updatedAt: new Date() }
        });

        const duration = Date.now() - start;
        console.log(`Update successful! Took ${duration}ms`);
        console.log("Cart is NOT locked.");

    } catch (error) {
        console.error("Update failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkLock();
