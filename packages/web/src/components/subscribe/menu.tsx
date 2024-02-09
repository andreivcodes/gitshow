"use client";

import { useEffect, useRef, useState } from "react";
import { PriceCard } from "./price-card";
import { Button } from "../ui/button";
import { getStripe } from "@/lib/stripe-client";
import { useSession } from "next-auth/react";
import { SubscriptionPlan } from "@gitshow/gitshow-lib";
import Link from "next/link";

export type ProductType = {
  name: string;
  type: SubscriptionPlan;
  recurrence: string;
  price: string;
  description: string[];
};

const products: ProductType[] = [
  {
    name: "Free",
    type: SubscriptionPlan.Free,
    recurrence: "year",
    price: "0,00",
    description: ["Free forever", "Monthly updates"],
  },
  {
    name: "Premium",
    type: SubscriptionPlan.Premium,
    recurrence: "year",
    price: "25,00",
    description: ["Hourly updates", "More themes", "No branding"],
  },
];

export function PriceMenu({
  currentSubscription,
}: {
  currentSubscription: SubscriptionPlan;
}) {
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(
    products.find((p) => p.type === currentSubscription) ?? products[0]
  );

  const productRefs = useRef(new Map()).current;

  useEffect(() => {
    const selectedRef = productRefs.get(selectedProduct);
    if (selectedRef) {
      selectedRef.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSubscription]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center items-center">
        <h3 className="text-xl font-semibold">Choose a plan</h3>
      </div>
      <div className="pt-10 flex flex-row items-center md:justify-center overflow-x-auto snap-proximity scroll-smooth snap-x gap-10 mb-5">
        {products.map((product) => (
          <div
            className="snap-center"
            key={product.type}
            ref={(el) => productRefs.set(product.type, el)}
          >
            <div
              key={product.name}
              onClick={() => {
                setSelectedProduct(product);
              }}
              onKeyDown={() => {
                setSelectedProduct(product);
              }}
            >
              <PriceCard
                selectedPlan={selectedProduct.type}
                product={product}
              />
            </div>
          </div>
        ))}
      </div>
      {selectedProduct.type == SubscriptionPlan.Free && (
        <Link href="/">
          <Button variant="default">Go back</Button>
        </Link>
      )}
      {selectedProduct.type == SubscriptionPlan.Premium && <CheckoutButton />}
    </div>
  );
}

const CheckoutButton = () => {
  const session = useSession();

  async function handleCreateCheckoutSession() {
    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //   type: subscription.subscriptionType,
          //   theme: subscription.theme,
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
    <Button onClick={() => handleCreateCheckoutSession()} variant="default">
      Go To Checkout
    </Button>
  );
};
