import { useSession } from "next-auth/react";
import { useContext, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { getStripe } from "../lib/stripeClient";
import { PriceCard } from "./checkout-item";
import { SubscriptionContext } from "../pages";
import {
  AvailableSubscriptionTypes,
  FREE_PLAN,
  PREMIUM_PLAN,
} from "@gitshow/gitshow-lib";
import { FREE_PLAN_ID, PREMIUM_PLAN_ID } from "../lib/plans";

export type ProductType = {
  name: string;
  type: AvailableSubscriptionTypes;
  recurrence: string;
  price: string;
  productId: string;
  description: string[];
  detailedDescription: string[];
};

const products: ProductType[] = [
  {
    name: "Free",
    type: FREE_PLAN,
    recurrence: "year",
    price: "0,00",
    productId: FREE_PLAN_ID,
    description: ["Free forever", "Weekly updates"],
    detailedDescription: [
      "Generates a basic Twitter profile header from your GitHub contributions.",
      "Weekly header update.",
    ],
  },
  {
    name: "Premium",
    type: PREMIUM_PLAN,
    recurrence: "year",
    price: "25,00",
    productId: PREMIUM_PLAN_ID,
    description: ["Hourly updates", "More themes", "No branding"],
    detailedDescription: [
      "Hourly updates for the most up-to-date GitHub activity display.",
      "Multiple additional theme options for your Twitter header.",
      "No gitshow branding on your Twitter header.",
    ],
  },
];

export function CheckoutMenu() {
  const subscription = useContext(SubscriptionContext);

  const selectedProduct =
    products.find((p) => p.type === subscription.subscriptionType) ??
    products[0];

  const productRefs = useRef(new Map()).current;

  useEffect(() => {
    const selectedRef = productRefs.get(selectedProduct.type);
    if (selectedRef) {
      selectedRef.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [subscription.subscriptionType]);

  return (
    <div className="m-auto flex flex-col items-center">
      <div className="mt-12 lg:mt-0 flex justify-center items-center">
        <h3 className="text-xl font-semibold">Choose a plan</h3>
      </div>
      <div className="w-screen 2xl:w-full pt-10 flex flex-row items-center md:justify-center overflow-x-auto snap-proximity scroll-smooth snap-x gap-10 mb-5 px-24">
        {products.map((product) => (
          <div
            className="snap-center"
            key={product.type}
            ref={(el) => productRefs.set(product.type, el)}
          >
            <PriceCard key={product.productId} product={product} />
          </div>
        ))}
      </div>
      <CheckoutButton />
      {selectedProduct && (
        <div className={"text-center w-full max-w-[700px] p-4"}>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">
              What&apos;s included:
            </h3>
            <ul className="list-none space-y-2">
              {selectedProduct.detailedDescription.map((detail) => (
                <li key={detail.length} className="flex items-center space-x-2">
                  <svg
                    className="h-6 w-8 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const CheckoutButton = () => {
  const session = useSession();
  const subscription = useContext(SubscriptionContext);

  async function handleCreateCheckoutSession() {
    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: subscription.subscriptionType,
        }),
      });
      const { session } = await response.json();
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.warn("Failed to create checkout session", error);
    }
  }

  return (
    session.data?.user.subscription_type === "none" && (
      <Button onClick={() => handleCreateCheckoutSession()} variant="default">
        Go To Checkout
      </Button>
    )
  );
};
