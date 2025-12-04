import express, { Express } from "express";
import { setupSwagger } from "../lib/swagger/swagger";
import { CustomError, errorHandler } from "./errors";
import { StatusCodes } from "http-status-codes";
import * as Routers from "../routes/index.routes";
import cookieParser from "cookie-parser";
import cors from "cors";

const initiateApp = (app: Express) => {
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

    app.use((req, res, next) => {
        throw new CustomError({
            statusCode: StatusCodes.NOT_FOUND,
            message: "Not Found",
        });
    });

    app.use(errorHandler);

    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
        console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
    });
};

export { initiateApp };