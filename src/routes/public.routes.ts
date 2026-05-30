import express from "express";

const publicRouter = express.Router();

/** Public config for the customer storefront (no auth). */
publicRouter.get("/config", (_req, res) => {
  res.json({
    success: true,
    data: {
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    },
  });
});

export { publicRouter };
