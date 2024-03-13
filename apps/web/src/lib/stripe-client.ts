import { loadStripe } from "@stripe/stripe-js";

export const getStripe = () => {
  console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};
