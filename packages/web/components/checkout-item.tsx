import * as React from "react";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { ProductType } from "./checkout-menu";
import { useToast } from "./ui/use-toast";
import { ThemeSelect } from "./theme-select";

export function PriceCard({
  product,
  selectedProduct,
  setSelectedProduct,
}: {
  product: {
    name: string;
    id: string;
    type: string;
    price: string;
    productId: string;
    description: string[];
    detailedDescription: string[];
  };
  selectedProduct: ProductType;
  setSelectedProduct: React.Dispatch<React.SetStateAction<ProductType>>;
}) {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme");

  return (
    <div
      className={`w-52 h-72 transition-transform ease-in-out rounded-lg ${
        selectedProduct.id === product.id && product.id === "premium"
          ? "p-0.5 animate-premium-select -translate-y-4"
          : "hover:-translate-y-4"
      } 
      ${
        selectedProduct.id === product.id && product.id === "standard"
          ? "p-0.5 animate-standard-select -translate-y-4"
          : "hover:-translate-y-4"
      }
      ${
        selectedProduct.id === product.id && product.id === "free"
          ? "p-0.5 animate-free-select -translate-y-4"
          : "hover:-translate-y-4"
      }
      `}
      onClick={() => {
        setSelectedProduct(product);
      }}
      onKeyDown={() => {
        setSelectedProduct(product);
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
        <CardFooter className="pt-10">
          {selectedProduct.id === product.id && product.name === "Premium" && (
            <ThemeSelect selected={theme} />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
