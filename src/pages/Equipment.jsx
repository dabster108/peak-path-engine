import CollectionPage from "./CollectionPage";

const equipmentProducts = [
  // Trekking Poles
  {
    id: 1,
    name: "Carbon Summit Poles",
    category: "Trekking Poles",
    price: 9999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #374151 0%, #1B4332 100%)",
  },
  {
    id: 2,
    name: "Folding Aluminium Poles",
    category: "Trekking Poles",
    price: 6499,
    originalPrice: 8499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #2d3748 0%, #374151 100%)",
  },
  // Goggles
  {
    id: 3,
    name: "Glacier Vision Pro",
    category: "Goggles",
    price: 8999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  },
  {
    id: 4,
    name: "Storm Shield Goggles",
    category: "Goggles",
    price: 5999,
    originalPrice: 7499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)",
  },
  // Headlamps
  {
    id: 5,
    name: "Vertex 500 Headlamp",
    category: "Headlamps",
    price: 3999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  },
  {
    id: 6,
    name: "Ultra-Trail Headlamp",
    category: "Headlamps",
    price: 2999,
    originalPrice: 3799,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
  },
  // Sleeping Bags
  {
    id: 7,
    name: "Arctic -20°C Sleeping Bag",
    category: "Sleeping Bags",
    price: 14999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  },
  {
    id: 8,
    name: "Trekker 3-Season Bag",
    category: "Sleeping Bags",
    price: 8499,
    originalPrice: 10999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #1e3a5f 100%)",
  },
  // Tents
  {
    id: 9,
    name: "2-Person Alpine Dome",
    category: "Tents",
    price: 24999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #0d2b1e 0%, #1B4332 100%)",
  },
  {
    id: 10,
    name: "Solo Bivy Ultralight",
    category: "Tents",
    price: 12999,
    originalPrice: 16499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #374151 0%, #0d2b1e 100%)",
  },
];

export default function Equipment() {
  return (
    <CollectionPage
      title="Equipment"
      subtitle="Professional-grade mountain gear. From base camp setup to summit push — everything you need to conquer."
      eyebrow="Gear — Equipment 2026"
      heroGradient="linear-gradient(135deg, #111827 0%, #374151 50%, #1e3a5f 100%)"
      filters={[
        "Trekking Poles",
        "Goggles",
        "Headlamps",
        "Sleeping Bags",
        "Tents",
      ]}
      products={equipmentProducts}
    />
  );
}
