import { useEffect, useState } from "react";
import CollectionPage from "./CollectionPage";
import api from "../utils/api";
import { normaliseProduct } from "../utils/normaliseProduct";

export default function Goretex() {
  const [products, setProducts]       = useState([]);
  const [subSections, setSubSections] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("products/"),
      api.get("sections/"),
    ]).then(([productsRes, sectionsRes]) => {
      const goretexSection = sectionsRes.data.find((s) =>
        ["gore-tex", "goretex"].includes(s.name.toLowerCase())
      );

      // FIX: Handle paginated response — unwrap results array
      const raw = productsRes.data.results ?? productsRes.data;
      const goretex = raw
        .filter((p) => ["gore-tex"].includes((p.section || "").toLowerCase()))
        .map((p, i) => normaliseProduct(p, i));

      setProducts(goretex);
      setSubSections(goretexSection?.sub_sections?.map((s) => s.name) || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <CollectionPage
      title="Gore-Tex Collection"
      subtitle="100% waterproof. Completely breathable. Built for the relentless Himalayan weather — from drizzle to downpour."
      eyebrow="Gore-Tex® — All Weather 2026"
      heroGradient="linear-gradient(135deg, #0d1b2a 0%, #1e3a5f 50%, #1B4332 100%)"
      filters={subSections}
      filterBy="sub_section"
      products={products}
      loading={loading}
    />
  );
}