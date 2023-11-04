"use client";

import { useState } from "react";
import PricingTable from "./PricingTable";
import { Config } from "sst/node/config";
import { loadStripe } from "@stripe/stripe-js";
import { getStripe } from "../utils/stripeClient";

const baseBtnStyle =
  "bg-slate-100 hover:bg-slate-200 text-black px-6 py-2 rounded-md capitalize font-bold mt-1";

const SubscriptionCard = () => {
  const [type, setType] = useState("yearly");
  const [plan, setPlan] = useState("price_1O7ObLHNuNMEdXGMc8dcCRW9");

  const handleCreateCheckoutSession = async (productId: string) => {
    const res = await fetch(`/api/stripe/checkout-session`, {
      method: "POST",
      body: JSON.stringify(productId),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const checkoutSession = await res.json().then((value) => {
      return value.session;
    });

    const stripe = await getStripe();
    const { error } = await stripe!.redirectToCheckout({
      sessionId: checkoutSession.id,
    });

    console.warn(error.message);
  };

  return (
    <div className="m-auto w-fit flex flex-col justify-center">
      <PricingTable
        selectedPlan={{ plan: plan, setPlan: setPlan }}
        selectedType={{ type: type, setType: setType }}
      />
      <button
        className={baseBtnStyle}
        onClick={() => handleCreateCheckoutSession(plan)}
      >
        Got To Checkout
      </button>
    </div>
  );
};

export default SubscriptionCard;
