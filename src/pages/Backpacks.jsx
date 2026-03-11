import CollectionPage from "./CollectionPage";

const backpacksProducts = [
  // Day Packs
  {
    id: 1,
    name: "Trailblazer 28L Day Pack",
    category: "Day Packs",
    price: 5999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  },
  {
    id: 2,
    name: "Peak Roamer 26L",
    category: "Day Packs",
    price: 4999,
    originalPrice: 6299,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
  },
  {
    id: 3,
    name: "Summit Dash 22L",
    category: "Day Packs",
    price: 3999,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #2d3748 0%, #1B4332 100%)",
  },
  // Trekking Packs
  {
    id: 4,
    name: "Summit Trek 45L",
    category: "Trekking Packs",
    price: 11999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1B4332 100%)",
  },
  {
    id: 5,
    name: "Ridge Walker 38L",
    category: "Trekking Packs",
    price: 9499,
    originalPrice: 12499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #2d3748 0%, #1e3a5f 100%)",
  },
  {
    id: 6,
    name: "Himalayan Carrier 50L",
    category: "Trekking Packs",
    price: 13999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #0d2b1e 0%, #2d3748 100%)",
  },
  // Summit Packs
  {
    id: 7,
    name: "Everest Expedition 65L",
    category: "Summit Packs",
    price: 18999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #0d2b1e 0%, #1e3a5f 100%)",
  },
  {
    id: 8,
    name: "Alpine Assault 55L",
    category: "Summit Packs",
    price: 15499,
    originalPrice: 19999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e40af 0%, #0d2b1e 100%)",
  },
  // Duffles
  {
    id: 9,
    name: "Base Camp Duffle 60L",
    category: "Duffles",
    price: 7999,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  },
  {
    id: 10,
    name: "Trail Duffle 40L",
    category: "Duffles",
    price: 5999,
    originalPrice: 7499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #92400e 0%, #374151 100%)",
  },
];

export default function Backpacks() {
  return (
    <CollectionPage
      title="Backpacks"
      subtitle="From summit day-packs to full expedition carries — built to go the distance with you."
      eyebrow="Gear — Backpacks 2026"
      heroGradient="linear-gradient(135deg, #0d2b1e 0%, #1e3a5f 50%, #1B4332 100%)"
      filters={["Day Packs", "Trekking Packs", "Summit Packs", "Duffles"]}
      products={backpacksProducts}
    />
  );
}
