import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

export default function Bottles() {
  const [products, setProducts]       = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("products/"),
      api.get("sub-sections/?section=bottles"),
    ]).then(([productsRes, subsRes]) => {
      const bottles = productsRes.data
        .filter((p) => (p.section || "").toLowerCase() === "bottles")
        .map((p, i) => normaliseProduct(p, i));
      setProducts(bottles);
      setSubSections(subsRes.data.map((s) => s.name));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Bottles & Hydration"
      subtitle="Stay hydrated from trailhead to summit. Hydra packs, filter bottles, insulated flasks, and more."
      eyebrow="Hydration — SS 2026"
      heroGradient="linear-gradient(135deg, #064e3b 0%, #1e3a5f 40%, #1B4332 100%)"
      filters={subSections}
      filterBy="sub_section"
      products={products}
      loading={loading}
    />
  );
}