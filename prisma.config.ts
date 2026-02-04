import { defineConfig } from "@prisma/config";
import "dotenv/config";

const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_LOCAL_PORT = process.env.DATABASE_LOCAL_PORT;
const DATABASE_NAME = process.env.DATABASE_NAME;


const DATABASE_URL = `postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@localhost:${DATABASE_LOCAL_PORT}/${DATABASE_NAME}?schema=public&connection_limit=50&pool_timeout=20`


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