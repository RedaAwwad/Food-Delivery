import express from 'express';
import { stripeWebhookController } from '../controllers/stripeWebhook.controller';

const router = express.Router();

/**
 * POST /webhooks/stripe
 *
 * IMPORTANT: express.raw() is required here.
 * Stripe signature verification needs the raw request body as a Buffer.
 * If express.json() runs first, the body is parsed and signature verification fails.
 *
 * This route is mounted in server.ts BEFORE app.use(express.json()).
 */
router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    (req, res) => stripeWebhookController.handleStripeWebhook(req, res)
);

export { router as webhookRouter };
