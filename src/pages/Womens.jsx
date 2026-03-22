// src\pages\Womens.jsx
import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";

const GRADIENTS = [
  "linear-gradient(135deg, #3b1f5e 0%, #2d3748 100%)",
  "linear-gradient(135deg, #374151 0%, #111827 100%)",
  "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  "linear-gradient(135deg, #1e3a5f 0%, #3b1f5e 100%)",
  "linear-gradient(135deg, #1e40af 0%, #1e1b4b 100%)",
  "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
  "linear-gradient(135deg, #744210 0%, #92400e 100%)",
];

function normaliseProduct(p, index) {
  const primaryImage =
    p.images && p.images.length > 0
      ? (p.images.find((img) => img.is_primary) || p.images[0]).image
      : null;

  return {
    ...p,
    price: parseFloat(p.price),
    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
    badge: p.badge || null,
    image: primaryImage || null,
    gradient: primaryImage ? null : GRADIENTS[index % GRADIENTS.length],
  };
}

export default function Womens() {
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        // Filter to Women's and Unisex products
        const womens = res.data
          .filter((p) =>
            ["women's", "unisex"].includes((p.category || "").toLowerCase()),
          )
          .map((p, i) => normaliseProduct(p, i));

        setProducts(womens);

        // Derive unique section names from fetched products for filter chips
        const uniqueSections = [
          ...new Set(womens.map((p) => p.section).filter(Boolean)),
        ];
        setSections(uniqueSections);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Women's Collection"
      subtitle="Engineered for her peak performance. Style that never sacrifices function."
      eyebrow="Women's — SS 2026"
      heroGradient="linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 40%, #1B4332 100%)"
      filters={sections}
      products={products}
      loading={loading}
    />
  );
}