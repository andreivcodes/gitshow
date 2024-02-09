"use client";

import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ProductType } from "./menu";
import { SubscriptionPlan } from "@gitshow/gitshow-lib";

export function PriceCard({
  product,
  selectedPlan,
}: {
  product: ProductType;
  selectedPlan: SubscriptionPlan;
}) {
  return (
    <div
      className={`w-52 h-72 transition-transform ease-in-out rounded-lg ${
        selectedPlan === product.type &&
        product.type === SubscriptionPlan.Premium
          ? "p-0.5 animate-premium-select -translate-y-4"
          : "hover:-translate-y-4"
      } 
      ${
        selectedPlan === product.type && product.type === SubscriptionPlan.Free
          ? "p-0.5 animate-free-select -translate-y-4"
          : "hover:-translate-y-4"
      }
      `}
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
