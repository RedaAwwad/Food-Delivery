import express, { Express } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
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

  // Premium admin dashboard (static SPA served from /public)
  const dashboardDir = path.join(process.cwd(), 'public');
  app.use('/dashboard', express.static(dashboardDir));
  app.get('/dashboard', (_req, res) => {
    res.sendFile(path.join(dashboardDir, 'index.html'));
  });

  // React landing (Vite build → client/dist) — run: npm run client:build
  const landingDir = path.join(process.cwd(), 'client', 'dist');
  const landingIndex = path.join(landingDir, 'index.html');
  if (!fs.existsSync(landingIndex)) {
    console.warn(
      '⚠️  Landing page missing. Build it: npm run client:build  →  then open /landing',
    );
  }
  const sendLanding = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!fs.existsSync(landingIndex)) {
      res.status(503).json({
        message: 'Landing not built. Run: npm run client:build',
        hint: 'Then restart the server (or docker compose restart node-app)',
      });
      return;
    }
    res.sendFile(landingIndex, (err) => {
      if (err) next(err);
    });
  };
  // Assets first; unmatched paths fall through to SPA (login, register, etc.)
  app.use(
    '/landing',
    express.static(landingDir, { index: false, fallthrough: true })
  );
  app.use('/landing', (req, res, next) => {
    if (req.method !== 'GET') return next();
    sendLanding(req, res, next);
  });

  // Customer-facing ordering storefront (static SPA served from /storefront)
  const shopDir = path.join(process.cwd(), 'storefront');
  app.use('/shop', express.static(shopDir));
  app.get('/shop', (_req, res) => {
    res.sendFile(path.join(shopDir, 'index.html'));
  });

  // Password-reset page (linked from the reset email)
  app.get('/auth/reset-password', (_req, res) => {
    res.sendFile(path.join(shopDir, 'auth', 'reset-password.html'));
  });

  setupSwagger(app);

  app.get("/", (req, res) => {
    if (req.accepts("html") && fs.existsSync(landingIndex)) {
      res.redirect(302, "/landing");
      return;
    }
    res.json({
      message: "Welcome to the Food Delivery API",
      version: process.env.API_VERSION || "v1",
      landing: "/landing",
      shop: "/shop",
      dashboard: "/dashboard",
      apiDocs: "/api-docs",
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
