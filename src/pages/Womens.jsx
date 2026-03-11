import CollectionPage from "./CollectionPage";

const womensProducts = [
  // Hiking Pants
  {
    id: 1,
    name: "Flora Trek Pants",
    category: "Hiking Pants",
    price: 6499,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #2d3748 100%)",
  },
  {
    id: 2,
    name: "Summit Slim-Fit Pants",
    category: "Hiking Pants",
    price: 7299,
    originalPrice: 8999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #374151 0%, #111827 100%)",
  },
  // Down Jackets
  {
    id: 3,
    name: "She-Summit Down Parka",
    category: "Down Jackets",
    price: 19999,
    originalPrice: 26999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  },
  {
    id: 4,
    name: "Featherlight Down Jacket",
    category: "Down Jackets",
    price: 15999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  },
  // Goretex
  {
    id: 5,
    name: "Storm Goddess Hardshell",
    category: "Goretex",
    price: 26999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #3b1f5e 100%)",
  },
  {
    id: 6,
    name: "Rainfall Pro Shell",
    category: "Goretex",
    price: 21999,
    originalPrice: 27999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)",
  },
  // Buffs
  {
    id: 7,
    name: "Merino Floral Buff",
    category: "Buffs",
    price: 1299,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
  },
  {
    id: 8,
    name: "Thermal Neck Warmer",
    category: "Buffs",
    price: 1699,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  },
  // Socks
  {
    id: 9,
    name: "Merino Light Hike Socks",
    category: "Socks",
    price: 799,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 10,
    name: "Coolmax Trek Socks",
    category: "Socks",
    price: 1099,
    originalPrice: 1399,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #065f46 0%, #1B4332 100%)",
  },
  // T-Shirts
  {
    id: 11,
    name: "Alpine Breeze Tee",
    category: "T-Shirts",
    price: 2299,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #374151 100%)",
  },
  {
    id: 12,
    name: "Summit Fitted Tee",
    category: "T-Shirts",
    price: 2999,
    originalPrice: 3799,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #374151 0%, #1B4332 100%)",
  },
  // Goggles
  {
    id: 13,
    name: "Chrome Mirror Goggles",
    category: "Goggles",
    price: 7999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  },
  {
    id: 14,
    name: "Powder Pro Goggles",
    category: "Goggles",
    price: 6999,
    originalPrice: 8499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)",
  },
  // Trekking Poles
  {
    id: 15,
    name: "Ultralight Carbon Poles",
    category: "Trekking Poles",
    price: 9499,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #374151 0%, #1B4332 100%)",
  },
  {
    id: 16,
    name: "Quick-Lock Trail Poles",
    category: "Trekking Poles",
    price: 6999,
    originalPrice: 8799,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #374151 100%)",
  },
];

export default function Womens() {
  return (
    <CollectionPage
      title="Women's Collection"
      subtitle="Engineered for her peak performance. Style that never sacrifices function."
      eyebrow="Women's — SS 2026"
      heroGradient="linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 40%, #1B4332 100%)"
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
      products={womensProducts}
    />
  );
}
