// src\pages\Equipment.jsx
import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

const CATEGORY_FILTERS = ["Men's", "Women's", "Unisex"];

export default function Equipment() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        const equipment = res.data
          .filter((p) => (p.section || "").toLowerCase() === "equipment")
          .map((p, i) => normaliseProduct(p, i));
        setProducts(equipment);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Equipment"
      subtitle="Professional-grade mountain gear. From base camp setup to summit push — everything you need to conquer."
      eyebrow="Gear — Equipment 2026"
      heroGradient="linear-gradient(135deg, #111827 0%, #374151 50%, #1e3a5f 100%)"
      filters={CATEGORY_FILTERS}
      filterBy="category"
      products={products}
      loading={loading}
    />
  );
}