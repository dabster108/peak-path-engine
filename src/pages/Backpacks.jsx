import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

export default function Backpacks() {
  const [products, setProducts]       = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("products/"),
      api.get("sub-sections/?section=backpacks"),
    ]).then(([productsRes, subsRes]) => {
      const backpacks = productsRes.data
        .filter((p) => (p.section || "").toLowerCase() === "backpacks")
        .map((p, i) => normaliseProduct(p, i));
      setProducts(backpacks);
      setSubSections(subsRes.data.map((s) => s.name));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Backpacks"
      subtitle="From summit day-packs to full expedition carries — built to go the distance with you."
      eyebrow="Gear — Backpacks 2026"
      heroGradient="linear-gradient(135deg, #0d2b1e 0%, #1e3a5f 50%, #1B4332 100%)"
      filters={subSections}
      filterBy="sub_section"
      products={products}
      loading={loading}
    />
  );
}