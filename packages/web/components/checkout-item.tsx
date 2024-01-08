import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { SubscriptionContext } from "../pages";
import {
  AvailableSubscriptionTypes,
  PREMIUM_PLAN,
  FREE_PLAN,
} from "@gitshow/gitshow-lib";

export function PriceCard({
  product,
}: {
  product: {
    name: string;
    type: AvailableSubscriptionTypes;
    recurrence: string;
    price: string;
    productId: string;
    description: string[];
    detailedDescription: string[];
  };
}) {
  const subscription = React.useContext(SubscriptionContext);

  return (
    <div
      className={`w-52 h-72 transition-transform ease-in-out rounded-lg ${
        subscription.subscriptionType === product.type &&
        product.type === PREMIUM_PLAN
          ? "p-0.5 animate-premium-select -translate-y-4"
          : "hover:-translate-y-4"
      } 
      ${
        subscription.subscriptionType === product.type &&
        product.type === FREE_PLAN
          ? "p-0.5 animate-free-select -translate-y-4"
          : "hover:-translate-y-4"
      }
      `}
      onClick={() => {
        subscription.setSubscriptionType(product.type);
      }}
      onKeyDown={() => {
        subscription.setSubscriptionType(product.type);
      }}
    >
      <Card className="m-0.2 w-full h-full bg-zinc-950 snap-center">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>{product.price} $ / year</CardDescription>
        </CardHeader>
        <CardContent>
          {product.description.map((description) => (
            <p className="h-8" key={description}>
              {description}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
