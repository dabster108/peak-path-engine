import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

export default function Footwear() {
  const [products, setProducts]       = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("products/"),
      api.get("sub-sections/?section=footwear"),
    ]).then(([productsRes, subsRes]) => {
      const footwear = productsRes.data
        .filter((p) => (p.section || "").toLowerCase() === "footwear")
        .map((p, i) => normaliseProduct(p, i));
      setProducts(footwear);
      setSubSections(subsRes.data.map((s) => s.name));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Footwear"
      subtitle="From base camp to summit. Every step, every trail, engineered for grip and endurance."
      eyebrow="Footwear — SS 2026"
      heroGradient="linear-gradient(135deg, #374151 0%, #1e3a5f 40%, #0d2b1e 100%)"
      filters={subSections}
      filterBy="sub_section"
      products={products}
      loading={loading}
    />
  );
}