import CollectionPage from "./CollectionPage";

const womensProducts = [
  {
    id: 1,
    name: "Summit Shield Jacket",
    category: "Jackets",
    price: 16499,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  },
  {
    id: 2,
    name: "She-Summit Down Parka",
    category: "Jackets",
    price: 19999,
    originalPrice: 26999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  },
  {
    id: 3,
    name: "Alpine Trail Fleece",
    category: "Fleece",
    price: 9499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #92400e 0%, #D97706 40%, #744210 100%)",
  },
  {
    id: 4,
    name: "TrailBlazer Softshell",
    category: "Jackets",
    price: 11999,
    originalPrice: 14999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #2d3748 0%, #374151 100%)",
  },
  {
    id: 5,
    name: "Powder Rush Pants",
    category: "Pants",
    price: 8999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #2d3748 100%)",
  },
  {
    id: 6,
    name: "Summit Base Layer Set",
    category: "Base Layers",
    price: 5499,
    originalPrice: 6999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 7,
    name: "Ascent Cropped Tee",
    category: "Base Layers",
    price: 2499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
  },
  {
    id: 8,
    name: "Ridge Crest Hoodie",
    category: "Fleece",
    price: 7999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1B4332 100%)",
  },
];

export default function Womens() {
  return (
    <CollectionPage
      title="Women's Collection"
      subtitle="Engineered for her peak performance. Style that never sacrifices function."
      eyebrow="Women's — SS 2026"
      heroGradient="linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 40%, #1B4332 100%)"
      filters={["Jackets", "Fleece", "Pants", "Base Layers"]}
      products={womensProducts}
    />
  );
}
