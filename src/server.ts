import express, { Express } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { setupSwagger } from "./lib/swagger/swagger";
import { errorHandler, NotFoundError } from "./utils/errors";
import { initAPIRoutes } from "./routes";
import { initServer } from "./config/server.init";

dotenv.config();
const app = express();

const initiateApp = async (app: Express) => {
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

  initAPIRoutes(app);

  app.use(() => {
    throw NotFoundError("Not Found");
  });
  app.use(errorHandler);

  await initServer(app);
};

initiateApp(app);
