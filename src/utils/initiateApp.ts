import express, { Express } from "express";
import { setupSwagger } from "../lib/swagger/swagger";
import { errorHandler, NotFoundError } from "./errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initAPIRoutes } from "../routes";
import { startServer } from "./startServer";
import { tokenValidator } from "../middleware/auth.middleware";

const initiateApp = async (app: Express) => {
  const apiPrefix = `/api/${process.env.API_VERSION || "v1"}`;

  app.use(express.json());

  app.use(cookieParser());

  app.use(cors());

  app.use(express.urlencoded({ extended: true }));

  app.use(tokenValidator);

  setupSwagger(app);

  app.get("/", (req, res) => {
    res.json({
      message: "Welcome to the Food Delivery API",
      version: process.env.API_VERSION || "v1",
    });
  });

  initAPIRoutes(app);

  app.use((req, res, next) => {
    throw NotFoundError("Not Found");
  });

  app.use(errorHandler);

  await startServer(app);
};

export { initiateApp };
