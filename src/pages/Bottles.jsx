import CollectionPage from "./CollectionPage";

const bottlesProducts = [
  {
    id: 1,
    name: "HydraPack 2L Reservoir",
    category: "Hydra Pack",
    price: 3499,
    originalPrice: 4499,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 2,
    name: "HydraPack 3L Expedition",
    category: "Hydra Pack",
    price: 4299,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #064e3b 0%, #1B4332 100%)",
  },
  {
    id: 3,
    name: "ClearStream Filter Bottle",
    category: "Filter Bottle",
    price: 2799,
    originalPrice: 3499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)",
  },
  {
    id: 4,
    name: "PureFlow Filter 650ml",
    category: "Filter Bottle",
    price: 2299,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)",
  },
  {
    id: 5,
    name: "Summit Sip 100ml",
    category: "Water Bottle",
    price: 499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #374151 0%, #1e3a5f 100%)",
  },
  {
    id: 6,
    name: "Trail Carry 500ml",
    category: "Water Bottle",
    price: 799,
    originalPrice: 999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #374151 0%, #2d3748 100%)",
  },
  {
    id: 7,
    name: "IceKeep Vacuum Flask 500ml",
    category: "Flask & Thermos",
    price: 1999,
    originalPrice: 2499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
  },
  {
    id: 8,
    name: "AlpineTherm Flask 750ml",
    category: "Flask & Thermos",
    price: 2499,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #78350f 0%, #92400e 100%)",
  },
  {
    id: 9,
    name: "BaseCamp Thermos 1L",
    category: "Flask & Thermos",
    price: 2999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1B4332 100%)",
  },
];

export default function Bottles() {
  return (
    <CollectionPage
      title="Bottles & Hydration"
      subtitle="Stay hydrated from trailhead to summit. Hydra packs, filter bottles, insulated flasks, and more."
      eyebrow="Hydration — SS 2026"
      heroGradient="linear-gradient(135deg, #064e3b 0%, #1e3a5f 40%, #1B4332 100%)"
      filters={[
        "Hydra Pack",
        "Filter Bottle",
        "Water Bottle",
        "Flask & Thermos",
      ]}
      products={bottlesProducts}
    />
  );
}
