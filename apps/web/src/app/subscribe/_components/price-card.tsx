"use client";

import * as React from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "./menu";
import { SubscriptionPlan } from "@prisma/client";

export function PriceCard({ product, selectedPlan }: { product: ProductType; selectedPlan: SubscriptionPlan }) {
  return (
    <div
      className={`h-72 w-52 rounded-lg transition-transform ease-in-out ${
        selectedPlan === product.plan && product.plan === "PREMIUM"
          ? "animate-premium-select -translate-y-4 p-0.5"
          : "hover:-translate-y-4"
      }
      ${
        selectedPlan === product.plan && product.plan === "FREE"
          ? "animate-free-select -translate-y-4 p-0.5"
          : "hover:-translate-y-4"
      }
      `}
    >
      <Card className="m-0.2 h-full w-full snap-center bg-zinc-950">
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
