// src\pages\Footwear.jsx
import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

const CATEGORY_FILTERS = ["Men's", "Women's", "Unisex"];

export default function Footwear() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        const footwear = res.data
          .filter((p) => (p.section || "").toLowerCase() === "footwear")
          .map((p, i) => normaliseProduct(p, i));
        setProducts(footwear);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Footwear"
      subtitle="From base camp to summit. Every step, every trail, engineered for grip and endurance."
      eyebrow="Footwear — SS 2026"
      heroGradient="linear-gradient(135deg, #374151 0%, #1e3a5f 40%, #0d2b1e 100%)"
      filters={CATEGORY_FILTERS}
      filterBy="category"
      products={products}
      loading={loading}
    />
  );
}