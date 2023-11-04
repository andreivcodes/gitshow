const products = [
  {
    products: [
      {
        name: "standard",
        type: "year",
        price: "10,00",
        productId: "price_1O7OaXHNuNMEdXGMt3aabIZx",
        description: ["Standard", "Weekly updates"],
        active: true,
      },
      {
        name: "premium",
        type: "year",
        price: "25,00",
        productId: "price_1O7ObLHNuNMEdXGMc8dcCRW9",
        description: ["Premium", "Daily updates"],
        active: true,
      },
    ],
  },
];

function ProductCard({
  selectedPlan,
  product,
}: {
  selectedPlan: {
    plan: string;
    setPlan: React.Dispatch<React.SetStateAction<string>>;
  };
  product: {
    name: string;
    type: string;
    price: string;
    productId: string;
    description: string[];
    active: boolean;
  };
}) {
  if (product.active) {
    return (
      <div
        className={`p-10 border-2 hover:cursor-pointer ${
          selectedPlan.plan === product.productId
            ? "-translate-y-2"
            : "hover:-translate-y-2"
        } transition-all w-full max-w-[21rem] min-h-[22rem] bg-black`}
        onClick={() => selectedPlan.setPlan(product.productId)}
      >
        <div className="font-bold text-3xl mb-2 capitalize">
          {product.name} Plan
        </div>
        <div className="flex items-baseline mb-2">
          <div className="text-3xl mr-2">${product.price}</div> Per{" "}
          {product.type}
        </div>
        <ul className="list-disc pl-4 ">
          {product.description.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div
      className={`p-10 border-2 border-neutral-400 text-neutral-400 w-full max-w-[21rem] min-h-[22rem] bg-black`}
    >
      <div className="font-bold text-3xl mb-2 capitalize">
        {product.name} Plan
      </div>
      <div className="flex items-baseline mb-2">
        <div className="text-3xl mr-2">${product.price}</div> Per {product.type}
      </div>
      <ul className="list-disc pl-4 ">
        {product.description.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const PricingTable = ({
  selectedPlan,
  selectedType,
}: {
  selectedPlan: {
    plan: string;
    setPlan: React.Dispatch<React.SetStateAction<string>>;
  };
  selectedType: {
    type: string;
    setType: React.Dispatch<React.SetStateAction<string>>;
  };
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {selectedType.type === "monthly"
          ? products[1].products.map((product, index) => (
              <ProductCard
                selectedPlan={selectedPlan}
                product={product}
                key={index}
              />
            ))
          : products[0].products.map((product, index) => (
              <ProductCard
                selectedPlan={selectedPlan}
                product={product}
                key={index}
              />
            ))}
      </div>
    </>
  );
};

export default PricingTable;
