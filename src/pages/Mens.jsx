import CollectionPage from "./CollectionPage";

const mensProducts = [
  // Hiking Pants
  {
    id: 1,
    name: "Summit Trek Pants",
    category: "Hiking Pants",
    price: 6999,
    originalPrice: 8999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
  },
  {
    id: 2,
    name: "Alpine Convertible Pants",
    category: "Hiking Pants",
    price: 7499,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
  },
  // Down Jackets
  {
    id: 3,
    name: "Himalayan Down Parka",
    category: "Down Jackets",
    price: 18999,
    originalPrice: 24999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  },
  {
    id: 4,
    name: "800-Fill Summit Down",
    category: "Down Jackets",
    price: 22999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  },
  // Goretex
  {
    id: 5,
    name: "Gore-Tex Alpine Shell",
    category: "Goretex",
    price: 28999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)",
  },
  {
    id: 6,
    name: "Storm Shield Hardshell",
    category: "Goretex",
    price: 24999,
    originalPrice: 32999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
  },
  // Buffs
  {
    id: 7,
    name: "Merino Neck Gaiter",
    category: "Buffs",
    price: 1499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  },
  {
    id: 8,
    name: "Thermal Balaclava Buff",
    category: "Buffs",
    price: 1999,
    originalPrice: 2499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
  },
  // Socks
  {
    id: 9,
    name: "Merino Trek Socks",
    category: "Socks",
    price: 899,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 10,
    name: "Cushioned Boot Socks",
    category: "Socks",
    price: 1299,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #065f46 0%, #1B4332 100%)",
  },
  // T-Shirts
  {
    id: 11,
    name: "DryFit Summit Tee",
    category: "T-Shirts",
    price: 2499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #374151 0%, #1B4332 100%)",
  },
  {
    id: 12,
    name: "Merino Wool Base Tee",
    category: "T-Shirts",
    price: 3999,
    originalPrice: 4999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #2d3748 0%, #374151 100%)",
  },
  // Goggles
  {
    id: 13,
    name: "Glacier Vision Pro",
    category: "Goggles",
    price: 8999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  },
  {
    id: 14,
    name: "Anti-Fog Summit Goggles",
    category: "Goggles",
    price: 6499,
    originalPrice: 7999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #3b1f5e 100%)",
  },
  // Trekking Poles
  {
    id: 15,
    name: "Carbon Summit Poles",
    category: "Trekking Poles",
    price: 9999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #374151 0%, #0d2b1e 100%)",
  },
  {
    id: 16,
    name: "Folding Trail Poles",
    category: "Trekking Poles",
    price: 7499,
    originalPrice: 9499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #374151 100%)",
  },
];

export default function Mens() {
  return (
    <CollectionPage
      title="Men's Collection"
      subtitle="Built for the summit. Designed for every condition between base camp and the top."
      eyebrow="Men's — SS 2026"
      heroGradient="linear-gradient(135deg, #0d2b1e 0%, #1B4332 40%, #1e3a5f 100%)"
      filters={[
        "Hiking Pants",
        "Down Jackets",
        "Goretex",
        "Buffs",
        "Socks",
        "T-Shirts",
        "Goggles",
        "Trekking Poles",
      ]}
      products={mensProducts}
    />
  );
}
