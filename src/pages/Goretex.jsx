import CollectionPage from "./CollectionPage";

const goretexProducts = [
  // Men's Jackets
  {
    id: 1,
    name: "Men's Gore-Tex Alpine Shell",
    category: "Men's Jackets",
    price: 28999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)",
  },
  {
    id: 2,
    name: "Men's Storm Shield Hardshell",
    category: "Men's Jackets",
    price: 24999,
    originalPrice: 32999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
  },
  {
    id: 3,
    name: "Men's Gore-Tex Pro Anorak",
    category: "Men's Jackets",
    price: 34999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 100%)",
  },
  // Women's Jackets
  {
    id: 4,
    name: "Women's Storm Goddess Shell",
    category: "Women's Jackets",
    price: 26999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e3a5f 100%)",
  },
  {
    id: 5,
    name: "Women's Rainfall Pro Shell",
    category: "Women's Jackets",
    price: 21999,
    originalPrice: 27999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e40af 0%, #3b1f5e 100%)",
  },
  {
    id: 6,
    name: "Women's Summit Ridge Shell",
    category: "Women's Jackets",
    price: 29999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #3b1f5e 100%)",
  },
  // Pants
  {
    id: 7,
    name: "Men's Gore-Tex Summit Pants",
    category: "Pants",
    price: 18999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #111827 100%)",
  },
  {
    id: 8,
    name: "Women's Gore-Tex Trail Pants",
    category: "Pants",
    price: 17499,
    originalPrice: 21999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #2d3748 0%, #1e3a5f 100%)",
  },
  {
    id: 9,
    name: "Unisex Mountain Bib Pants",
    category: "Pants",
    price: 21999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #374151 0%, #1e3a5f 100%)",
  },
  // Rain Sets
  {
    id: 10,
    name: "Packable Rain Set — Men's",
    category: "Rain Sets",
    price: 12999,
    originalPrice: 16499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #0d2b1e 0%, #1e3a5f 100%)",
  },
  {
    id: 11,
    name: "Packable Rain Set — Women's",
    category: "Rain Sets",
    price: 11999,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #1B4332 0%, #3b1f5e 100%)",
  },
  // Raincoats
  {
    id: 12,
    name: "Ultralight Raincoat — Men's",
    category: "Raincoats",
    price: 8999,
    originalPrice: 10999,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #1e40af 0%, #0d2b1e 100%)",
  },
  {
    id: 13,
    name: "Ultralight Raincoat — Women's",
    category: "Raincoats",
    price: 8499,
    originalPrice: null,
    badge: null,
    gradient: "linear-gradient(135deg, #3b1f5e 0%, #1e40af 100%)",
  },
  // Shoe Covers
  {
    id: 14,
    name: "Gore-Tex Gaiter Shoe Covers",
    category: "Shoe Covers",
    price: 4499,
    originalPrice: null,
    badge: "New",
    gradient: "linear-gradient(135deg, #374151 0%, #1e3a5f 100%)",
  },
  {
    id: 15,
    name: "Neoprene Gore-Tex Overboots",
    category: "Shoe Covers",
    price: 5999,
    originalPrice: 7499,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
  },
  // Gore-Tex Socks
  {
    id: 16,
    name: "Gore-Tex Waterproof Socks",
    category: "Socks",
    price: 2999,
    originalPrice: null,
    badge: "Bestseller",
    gradient: "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  },
  {
    id: 17,
    name: "Gore-Tex Knee-High Trek Socks",
    category: "Socks",
    price: 3499,
    originalPrice: 4299,
    badge: "Sale",
    gradient: "linear-gradient(135deg, #065f46 0%, #1e3a5f 100%)",
  },
];

export default function Goretex() {
  return (
    <CollectionPage
      title="Gore-Tex Collection"
      subtitle="100% waterproof. Completely breathable. Built for the relentless Himalayan weather — from drizzle to downpour."
      eyebrow="Gore-Tex® — All Weather 2026"
      heroGradient="linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 50%, #1B4332 100%)"
      filters={[
        "Men's Jackets",
        "Women's Jackets",
        "Pants",
        "Rain Sets",
        "Raincoats",
        "Shoe Covers",
        "Socks",
      ]}
      products={goretexProducts}
    />
  );
}
