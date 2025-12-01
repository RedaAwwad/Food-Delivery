import express, { Express } from "express";
import { setupSwagger } from "../lib/swagger/swagger";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../utils/errors/error-handler";
import * as Routers from "../routes/index.routes";
import { globalErrorHandler } from "./errors/async-handler";
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
    app.use(`${apiPrefix}/user`, Routers.userRouter);

    app.use((req, res, next) => {
        throw new CustomError({
            statusCode: StatusCodes.NOT_FOUND,
            message: "Not Found",
        });
    });

    app.use(errorHandler);

    // app.use(globalErrorHandler);

    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server running on ${process.env.APP_BASE_URL}`);
        console.log(`📖 API docs: ${process.env.APP_BASE_URL}/api-docs`);
    });
};

export { initiateApp };