// src\pages\Mens.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";

const GRADIENTS = [
  "linear-gradient(135deg, #374151 0%, #111827 100%)",
  "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
  "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  "linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 100%)",
  "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
  "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
];

function normaliseProduct(p, index) {
  const primaryImage =
    p.images?.length > 0
      ? (p.images.find((img) => img.is_primary) || p.images[0]).image
      : null;
  return {
    ...p,
    price:         parseFloat(p.price),
    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
    badge:         p.badge || null,
    image:         primaryImage || null,
    gradient:      primaryImage ? null : GRADIENTS[index % GRADIENTS.length],
  };
}

export default function Mens() {
  const location      = useLocation();
  const [products, setProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);

  const initialFilter = location.state?.filterSection || null;

  useEffect(() => {
    api.get("products/")
      .then((res) => {
        // FIX: paginated response — unwrap results array
        const raw = res.data.results ?? res.data;
        const mens = raw
          .filter((p) =>
            ["men's", "men", "unisex"].includes((p.category || "").toLowerCase())
          )
          .map((p, i) => normaliseProduct(p, i));
        setProducts(mens);
        setSections([...new Set(mens.map((p) => p.section).filter(Boolean))]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Men's Collection"
      subtitle="Built for the summit. Designed for every condition between base camp and the top."
      eyebrow="Men's — SS 2026"
      heroGradient="linear-gradient(135deg, #0d2b1e 0%, #1B4332 40%, #1e3a5f 100%)"
      filters={sections}
      filterBy="section"
      initialFilter={initialFilter}
      products={products}
      loading={loading}
    />
  );
}