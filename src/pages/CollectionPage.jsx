// src\pages\CollectionPage.jsx
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import ChatModal from "../components/ChatModal";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import "./Collection.css";

const sortOptions = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
];

export default function CollectionPage({
  title,
  subtitle,
  eyebrow,
  heroGradient,
  filters,
  products,
  loading = false,
  filterBy = "section", // "section" for Mens/Womens, "category" for Goretex/Footwear etc
}) {
  useScrollAnimations();
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState("Featured");
  const [chatOpen, setChatOpen] = useState(false);

  const filtered =
    activeFilter === "All"
      ? products
      : products.filter((p) => {
          const field = filterBy === "category" ? p.category : p.section;
          return (field || "").toLowerCase() === activeFilter.toLowerCase();
        });

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === "Price: Low to High")
      return parseFloat(a.price) - parseFloat(b.price);
    if (activeSort === "Price: High to Low")
      return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  return (
    <main className="collection-page">
      {/* Hero Banner */}
      <section className="collection-hero" style={{ background: heroGradient }}>
        <div className="collection-hero__grain" />
        <div className="container">
          <span className="section-label">{eyebrow}</span>
          <h1 className="collection-hero__title">{title}</h1>
          <p className="collection-hero__sub">{subtitle}</p>
        </div>
        <div className="collection-hero__bottom">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
            <path
              d="M0 80L240 20L480 55L720 5L960 45L1200 15L1440 50V80H0Z"
              fill="#FAF7F2"
            />
          </svg>
        </div>
      </section>

      {/* Filter/Sort Bar */}
      <div className="collection-bar">
        <div className="container">
          <div className="collection-bar__inner">
            <div className="collection-bar__filters">
              {["All", ...filters].map((f) => (
                <button
                  key={f}
                  className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="collection-bar__right">
              <span className="collection-count">
                {loading ? "…" : `${sorted.length} items`}
              </span>
              <select
                className="sort-select"
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
              >
                {sortOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="collection-grid-section">
        <div className="container">
          {loading ? (
            <div className="collection-loading">Loading products…</div>
          ) : sorted.length === 0 ? (
            <div className="collection-loading">No products found.</div>
          ) : (
            <div className="collection-grid">
              {sorted.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="collection-bottom-cta">
        <div className="container">
          <div className="collection-cta-inner reveal">
            <span className="section-label">Need help?</span>
            <h2>Find Your Perfect Fit</h2>
            <p>Use our expert size guide or chat with a gear specialist.</p>
            <div className="collection-cta-btns">
              <button className="btn btn-primary">Size Guide</button>
              <button
                className="btn btn-outline"
                onClick={() => setChatOpen(true)}
              >
                Chat With Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}