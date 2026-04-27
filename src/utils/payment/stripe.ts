import Stripe from 'stripe';
import 'dotenv/config';
import { InternalServerError } from '../errors';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) throw InternalServerError('STRIPE_SECRET_KEY is missing in .env');

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2026-01-28.clover', // Use the latest API version
});

export default stripe;