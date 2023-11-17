import * as React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ProductType } from "./checkout-menu";
import { useRouter } from "next/router";
import { useToast } from "./ui/use-toast";

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
        selectedProduct.id == product.id && product.id == "premium"
          ? "p-0.5 animate-premium-select -translate-y-4"
          : "hover:-translate-y-4"
      } 
      ${
        selectedProduct.id == product.id && product.id == "standard"
          ? "p-0.5 animate-standard-select -translate-y-4"
          : "hover:-translate-y-4"
      }
      ${
        selectedProduct.id == product.id && product.id == "free"
          ? "p-0.5 animate-free-select -translate-y-4"
          : "hover:-translate-y-4"
      }
      `}
      onClick={() => {
        setSelectedProduct(product);
      }}
    >
      <Card className="m-0.2 w-full h-full bg-zinc-950 snap-center">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>{product.price} $ / year</CardDescription>
        </CardHeader>
        <CardContent>
          {product.description.map((description, index) => (
            <p className="h-8" key={index}>
              {description}
            </p>
          ))}
        </CardContent>
        <CardFooter className="pt-10">
          {selectedProduct.id == product.id && product.name == "Premium" && (
            <ThemeSelect selected={theme} />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

const ThemeSelect = ({ selected }: { selected: string | null }) => {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <Select
      onValueChange={(e) => {
        const setTheme = async () => {
          fetch(`/api/theme`, {
            body: JSON.stringify({
              theme: e,
            }),
            method: "POST",
          });
        };

        if (session.data?.user.subscription_type == "premium") {
          setTheme();
          toast({
            description: "Your theme has been changed",
          });
        }

        router.replace({
          query: { ...router.query, theme: e },
        });
      }}
      defaultValue={selected ? selected : undefined}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="classic">Classic</SelectItem>
          <SelectItem value="githubDark">Github Dark</SelectItem>
          <SelectItem value="dracula">Dracula</SelectItem>
          <SelectItem value="spooky">Spooky</SelectItem>
          <SelectItem value="bnw">Black and White</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
