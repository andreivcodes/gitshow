"use client";

import { useEffect, useRef, useState } from "react";
import { PriceCard } from "./price-card";
import { Button } from "../ui/button";
import { getStripe } from "@/lib/stripe-client";
import { SubscriptionPlan } from "@gitshow/gitshow-lib";
import Link from "next/link";
import { CheckoutRequest } from "@/app/api/stripe/checkout/route";

export type ProductType = {
  name: string;
  plan: SubscriptionPlan;
  recurrence: string;
  price: string;
  description: string[];
};

const products: ProductType[] = [
  {
    name: "Free",
    plan: SubscriptionPlan.Free,
    recurrence: "year",
    price: "0,00",
    description: ["Free forever", "Monthly updates"],
  },
  {
    name: "Premium",
    plan: SubscriptionPlan.Premium,
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
    products.find((p) => p.plan === currentSubscription) ?? products[0]
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
        <h3 className="text-xl font-semibold">Your plan</h3>
      </div>
      <div className="pt-10 flex flex-row items-center md:justify-center overflow-x-auto snap-proximity scroll-smooth snap-x gap-10 mb-5">
        {products.map((product) => (
          <div
            className="snap-center"
            key={product.plan}
            ref={(el) => productRefs.set(product.plan, el)}
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
                selectedPlan={selectedProduct.plan}
                product={product}
              />
            </div>
          </div>
        ))}
      </div>
      {selectedProduct.plan == SubscriptionPlan.Free && (
        <Link href="/">
          <Button variant="default">Go back</Button>
        </Link>
      )}

      {selectedProduct.plan == SubscriptionPlan.Premium &&
        selectedProduct.plan == currentSubscription && (
          <Link href="https://billing.stripe.com/p/login/test_dR63fYgaNapI6Z26or">
            <Button variant="default">Cancel subscription</Button>
          </Link>
        )}

      {selectedProduct.plan == SubscriptionPlan.Premium &&
        selectedProduct.plan != currentSubscription && (
          <CheckoutButton selectedProduct={selectedProduct} />
        )}
    </div>
  );
}

const CheckoutButton = ({
  selectedProduct,
}: {
  selectedProduct: ProductType;
}) => {
  async function handleCreateCheckoutSession() {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedProduct.plan,
        } as CheckoutRequest),
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
