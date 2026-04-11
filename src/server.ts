import express, { Express } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { setupSwagger } from "./lib/swagger/swagger";
import { errorHandler, NotFoundError } from "./utils/errors";
import { initAPIRoutes } from "./routes";
import { initServer } from "./config/server.init";
import { webhookRouter } from "./routes/webhook.routes";
import { testRouter } from "./routes/test.routes";
import { startStaleOrderJob } from "./jobs/staleOrder.job";

dotenv.config();
const app = express();

const initiateApp = async (app: Express) => {
  // ⚠️  Webhook route MUST be registered before express.json().
  // Stripe signature verification requires the raw Buffer body.
  // Once express.json() runs, the body is parsed and verification fails.
  app.use('/webhooks', webhookRouter);

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));

  // EJS view engine — only used by the /test/* dev harness pages
  app.set('view engine', 'ejs');
  app.set('views', path.join(process.cwd(), 'src', 'views'));

  // Dev-only test harness (login + checkout UI to exercise the payment flow)
  app.use('/test', testRouter);

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

  // Start background jobs
  startStaleOrderJob();
};

initiateApp(app);
