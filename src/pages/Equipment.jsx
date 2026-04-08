import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

export default function Equipment() {
  const [products, setProducts]       = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("products/"),
      api.get("sub-sections/?section=equipment"),
    ]).then(([productsRes, subsRes]) => {
      // FIX: Handle paginated response — unwrap results array
      const raw = productsRes.data.results ?? productsRes.data;
      const equipment = raw
        .filter((p) => (p.section || "").toLowerCase() === "equipment")
        .map((p, i) => normaliseProduct(p, i));
      setProducts(equipment);
      setSubSections(subsRes.data.map((s) => s.name));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Equipment"
      subtitle="Professional-grade mountain gear. From base camp setup to summit push — everything you need to conquer."
      eyebrow="Gear — Equipment 2026"
      heroGradient="linear-gradient(135deg, #111827 0%, #374151 50%, #1e3a5f 100%)"
      filters={subSections}
      filterBy="sub_section"
      products={products}
      loading={loading}
    />
  );
}