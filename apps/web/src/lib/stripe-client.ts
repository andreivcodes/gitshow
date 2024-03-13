import { loadStripe } from "@stripe/stripe-js";
import { config } from "dotenv";

export const getStripe = () => {
  config();
  console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};
