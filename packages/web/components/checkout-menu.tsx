import { AvailableSubscriptionTypes } from "@gitshow/svg-gen";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { FREE_PLAN, PREMIUM_PLAN, STANDARD_PLAN } from "../lib/plans";
import { getStripe } from "../lib/stripeClient";
import { PriceCard } from "./checkout-item";
import { useToast } from "./ui/use-toast";

export type ProductType = {
  name: string;
  id: string;
  type: string;
  price: string;
  productId: string;
  description: string[];
  detailedDescription: string[];
};

const products: ProductType[] = [
  {
    name: "Free",
    id: "free",
    type: "year",
    price: "0,00",
    productId: FREE_PLAN,
    description: ["Free forever", "Monthly updates"],
    detailedDescription: [
      "Generates a basic Twitter profile header from your GitHub contributions.",
      "Monthly header update.",
    ],
  },
  {
    name: "Standard",
    id: "standard",
    type: "year",
    price: "10,00",
    productId: STANDARD_PLAN,
    description: ["Weekly updates", "No branding", "Dark theme"],
    detailedDescription: [
      "Weekly header updates for a fresher look.",
      "Removal of default branding from the header.",
      "Dark theme for your header.",
    ],
  },
  {
    name: "Premium",
    id: "premium",
    type: "year",
    price: "25,00",
    productId: PREMIUM_PLAN,
    description: ["Daily updates", "More themes"],
    detailedDescription: [
      "Daily updates for the most up-to-date GitHub activity display.",
      "Multiple additional theme options for your Twitter header.",
    ],
  },
];

export function CheckoutMenu({
  storedSubscriptionType,
}: {
  storedSubscriptionType: AvailableSubscriptionTypes;
}) {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState(
    products.find((p) => p.id === storedSubscriptionType) ?? products[0]
  );
  const productRefs = useRef(new Map()).current;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const newQuery = { ...router.query };

    if (selectedProduct.id === "free") newQuery.theme = "classic";
    else if (selectedProduct.id === "standard") newQuery.theme = "githubDark";

    const selectedRef = productRefs.get(selectedProduct.id);
    if (selectedRef) {
      selectedRef.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }

    if (
      session.data?.user.fullyAuthenticated == true &&
      session.data?.user.subscription_type !== "none" &&
      selectedProduct.id !== session.data?.user.subscription_type
    ) {
      toast({
        title: "You already have a subscription",
        description:
          "If you want to change your subscription, you have to cancel your existing one first.",
      });
    }

    router.replace({
      query: { ...newQuery, type: selectedProduct.id },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  return (
    <div className="m-auto flex flex-col items-center">
      <div className="mt-12 lg:mt-0 flex justify-center items-center">
        {session.data?.user.subscription_type === "none" ? (
          <h3 className="text-xl font-semibold">Choose a plan</h3>
        ) : (
          <h3 className="text-xl font-semibold">Manage your plan</h3>
        )}
      </div>
      <div className="w-screen 2xl:w-full pt-10 flex flex-row items-center md:justify-center overflow-x-auto snap-proximity scroll-smooth snap-x gap-10 mb-5 px-24">
        {products.map((product) => (
          <div
            className="snap-center"
            key={product.id}
            ref={(el) => productRefs.set(product.id, el)}
          >
            <PriceCard
              product={product}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              key={product.productId}
            />
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
                <li
                  key={selectedProduct.id}
                  className="flex items-center space-x-2"
                >
                  <svg
                    className="h-6 w-8 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                  >
                    <title>check</title>
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
  const searchParams = useSearchParams();

  const type = searchParams.get("type");
  const theme = searchParams.get("theme");

  async function handleCreateCheckoutSession() {
    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type,
          theme: theme,
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
