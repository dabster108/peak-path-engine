// src\pages\Bottles.jsx
import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

const CATEGORY_FILTERS = ["Men's", "Women's", "Unisex"];

export default function Bottles() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        const bottles = res.data
          .filter((p) => (p.section || "").toLowerCase() === "bottles")
          .map((p, i) => normaliseProduct(p, i));
        setProducts(bottles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Bottles & Hydration"
      subtitle="Stay hydrated from trailhead to summit. Hydra packs, filter bottles, insulated flasks, and more."
      eyebrow="Hydration — SS 2026"
      heroGradient="linear-gradient(135deg, #064e3b 0%, #1e3a5f 40%, #1B4332 100%)"
      filters={CATEGORY_FILTERS}
      filterBy="category"
      products={products}
      loading={loading}
    />
  );
}