import { loadStripe } from "@stripe/stripe-js";

const getStripe = () => {
  console.log(`key: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!}`);

  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

export default getStripe;
