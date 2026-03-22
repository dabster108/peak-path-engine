// src\pages\Backpacks.jsx
import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

const CATEGORY_FILTERS = ["Men's", "Women's", "Unisex"];

export default function Backpacks() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        const backpacks = res.data
          .filter((p) => (p.section || "").toLowerCase() === "backpacks")
          .map((p, i) => normaliseProduct(p, i));
        setProducts(backpacks);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Backpacks"
      subtitle="From summit day-packs to full expedition carries — built to go the distance with you."
      eyebrow="Gear — Backpacks 2026"
      heroGradient="linear-gradient(135deg, #0d2b1e 0%, #1e3a5f 50%, #1B4332 100%)"
      filters={CATEGORY_FILTERS}
      filterBy="category"
      products={products}
      loading={loading}
    />
  );
}