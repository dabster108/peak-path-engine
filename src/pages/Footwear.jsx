import CollectionPage from "./CollectionPage";

const footwearProducts = [
  {
    id: 1,
    name: "Everest Trek Boot",
    category: "Boots",
    price: 14999,
    originalPrice: 18999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  },
  {
    id: 2,
    name: "Summit Approach Shoe",
    category: "Trail",
    price: 9999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #374151 0%, #1e3a5f 100%)",
  },
  {
    id: 3,
    name: "Ridge Runner Mid",
    category: "Boots",
    price: 11499,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #92400e 0%, #744210 100%)",
  },
  {
    id: 4,
    name: "Alpine Gaiter High",
    category: "Accessories",
    price: 4499,
    originalPrice: 5499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #2d3748 0%, #374151 100%)",
  },
  {
    id: 5,
    name: "Trail Blazer Low",
    category: "Trail",
    price: 7999,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1B4332 100%)",
  },
  {
    id: 6,
    name: "Camp Comfort Slide",
    category: "Camp",
    price: 2999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 7,
    name: "Ice Grip Crampon Boot",
    category: "Boots",
    price: 19999,
    originalPrice: 24999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)",
  },
  {
    id: 8,
    name: "Ultra Sprint Trail",
    category: "Trail",
    price: 8499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #744210 0%, #1B4332 100%)",
  },
];

export default function Footwear() {
  return (
    <CollectionPage
      title="Footwear"
      subtitle="From base camp to summit. Every step, every trail, engineered for grip and endurance."
      eyebrow="Footwear — SS 2026"
      heroGradient="linear-gradient(135deg, #374151 0%, #1e3a5f 40%, #0d2b1e 100%)"
      filters={["Boots", "Trail", "Camp", "Accessories"]}
      products={footwearProducts}
    />
  );
}
