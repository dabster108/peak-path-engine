import CollectionPage from "./CollectionPage";

const mensProducts = [
  {
    id: 1,
    name: "Himalayan Down Parka",
    category: "Jackets",
    price: 18999,
    originalPrice: 24999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  },
  {
    id: 2,
    name: "Windwall Softshell Pro",
    category: "Jackets",
    price: 13999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
  },
  {
    id: 3,
    name: "Summit Fleece Pullover",
    category: "Fleece",
    price: 8999,
    originalPrice: 11999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  },
  {
    id: 4,
    name: "Alpine Hardshell",
    category: "Jackets",
    price: 22999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  },
  {
    id: 5,
    name: "Everest Base Layer Top",
    category: "Base Layers",
    price: 3999,
    originalPrice: 5299,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 6,
    name: "Trek Pro Pants",
    category: "Pants",
    price: 7499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
  },
  {
    id: 7,
    name: "Ridge Runner Tee",
    category: "Base Layers",
    price: 2999,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  },
  {
    id: 8,
    name: "Glacier Bib Pants",
    category: "Pants",
    price: 14499,
    originalPrice: 18999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0d2b1e 100%)",
  },
  {
    id: 9,
    name: "Base Camp Hoodie",
    category: "Fleece",
    price: 6999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #374151 0%, #1B4332 100%)",
  },
];

export default function Mens() {
  return (
    <CollectionPage
      title="Men's Collection"
      subtitle="Built for the summit. Designed for every condition between base camp and the top."
      eyebrow="Men's — SS 2026"
      heroGradient="linear-gradient(135deg, #0d2b1e 0%, #1B4332 40%, #1e3a5f 100%)"
      filters={["Jackets", "Fleece", "Pants", "Base Layers"]}
      products={mensProducts}
    />
  );
}
