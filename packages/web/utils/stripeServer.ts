import "server-only";

import { Config } from "sst/node/config";
import Stripe from "stripe";

export const stripe = new Stripe(Config.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});
