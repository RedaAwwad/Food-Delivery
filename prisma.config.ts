import { defineConfig } from "@prisma/config";
import "dotenv/config";

const DATABASE_USER = process.env.DB_USER;
const DATABASE_PASSWORD = process.env.DB_PASSWORD;
const DATABASE_LOCAL_PORT = process.env.DB_LOCAL_PORT;
const DATABASE_NAME = process.env.DB_NAME;


const DATABASE_URL = `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_LOCAL_PORT}/${DATABASE_NAME}?schema=public`


export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        url: DATABASE_URL,
    },
});