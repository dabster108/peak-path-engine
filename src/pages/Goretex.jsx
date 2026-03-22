// src\pages\Goretex.jsx
import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

const CATEGORY_FILTERS = ["Men's", "Women's", "Unisex"];

export default function Goretex() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        const goretex = res.data
          .filter((p) => (p.section || "").toLowerCase() === "goretex")
          .map((p, i) => normaliseProduct(p, i));
        setProducts(goretex);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Gore-Tex Collection"
      subtitle="100% waterproof. Completely breathable. Built for the relentless Himalayan weather — from drizzle to downpour."
      eyebrow="Gore-Tex® — All Weather 2026"
      heroGradient="linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 50%, #1B4332 100%)"
      filters={CATEGORY_FILTERS}
      filterBy="category"
      products={products}
      loading={loading}
    />
  );
}