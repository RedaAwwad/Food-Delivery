import express, { Express } from "express";
import { setupSwagger } from "../lib/swagger/swagger";
import { CustomError } from "../utils/errors/custom-error";
import { StatusCodes } from "http-status-codes";
import { errorHandler } from "../utils/errors/error-handler";
import * as Routers from "../routes/index.routes";

const initiateApp = (app: Express) => {
    const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

    app.use(express.json());

    setupSwagger(app);

    app.use(`${apiPrefix}/cart`, Routers.cartRouter);
    app.use(`${apiPrefix}/orders`, Routers.orderRouter);

    app.get("/", (req, res) => {
        res.json({
            message: "Welcome to the Food Delivery API",
            version: process.env.API_VERSION || "v1",
        });
    });

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