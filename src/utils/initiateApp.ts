import express, { Express } from "express";
import { setupSwagger } from "../lib/swagger/swagger";
import { CustomError, errorHandler } from "./errors";
import { StatusCodes } from "http-status-codes";
import * as Routers from "../routes/index.routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import { prisma } from "../config/prisma.config";

const initiateApp = async (app: Express) => {
    const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

    app.use(express.json());

    app.use(cookieParser());

    app.use(cors());

    app.use(express.urlencoded({ extended: true }));

    setupSwagger(app);

    app.get("/", (req, res) => {
        res.json({
            message: "Welcome to the Food Delivery API",
            version: process.env.API_VERSION || "v1",
        });
    });

    app.use(`${apiPrefix}/cart`, Routers.cartRouter);
    app.use(`${apiPrefix}/orders`, Routers.orderRouter);
    app.use(`${apiPrefix}/users`, Routers.userRouter);
    app.use(`${apiPrefix}/auth`, Routers.authRouter);
    app.use(`${apiPrefix}/roles`, Routers.roleRouter);

    app.use((req, res, next) => {
        throw new CustomError({
            statusCode: StatusCodes.NOT_FOUND,
            message: "Not Found",
        });
    });

    app.use(errorHandler);

    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        const server = app.listen(process.env.PORT, () => {
            console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
            console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            console.log('🛑 Shutting down server...');
            server.close(() => {
                console.log('HTTTP server closed.');
            });
            await prisma.$disconnect();
            console.log('Database disconnected.');
            process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
};

export { initiateApp };