// src\pages\Home.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ChatModal from "../components/ChatModal";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import api from "../utils/api";
import "./Home.css";

const categories = [
  "Fleece",
  "New Arrivals",
  "Rainwear",
  "Summit Ready",
  "Trekking Gear",
];

// Fallback gradients cycled when a product has no image
const GRADIENTS = [
  "linear-gradient(135deg, #1B4332 0%, #0d2b1e 100%)",
  "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
  "linear-gradient(135deg, #744210 0%, #92400e 100%)",
  "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
  "linear-gradient(135deg, #1B4332 0%, #065f46 100%)",
  "linear-gradient(135deg, #3b1f5e 0%, #1e1b4b 100%)",
  "linear-gradient(135deg, #374151 0%, #111827 100%)",
  "linear-gradient(135deg, #92400e 0%, #D97706 100%)",
];

// Normalise a raw API product so ProductCard gets all the props it needs
function normaliseProduct(p, index) {
  const primaryImage =
    p.images && p.images.length > 0
      ? (p.images.find((img) => img.is_primary) || p.images[0]).image
      : null;

  return {
    ...p,
    price: parseFloat(p.price),
    originalPrice: p.original_price ? parseFloat(p.original_price) : null,
    badge: p.badge || null,
    // If the product has a real image use it, otherwise fall back to a gradient
    image: primaryImage || null,
    gradient: primaryImage ? null : GRADIENTS[index % GRADIENTS.length],
  };
}

function Counter({ end, suffix = "", prefix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 2000;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start = Math.min(start + step, end);
            setCount(Math.floor(start));
            if (start >= end) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="counter-value">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Home() {
  useScrollAnimations();
  const heroRef = useRef(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [moreProducts, setMoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    api
      .get("products/")
      .then((res) => {
        const all = res.data.map((p, i) => normaliseProduct(p, i));
        // First 6 → featured, next 4 → "you may like"
        setFeaturedProducts(all.slice(0, 6));
        setMoreProducts(all.slice(6, 10));
      })
      .catch(() => {
        // Silently fail — sections just render empty
      })
      .finally(() => setLoading(false));
  }, []);

  // Parallax on hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY;
        heroRef.current.style.backgroundPositionY = `${y * 0.4}px`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="home">
      {/* ====== HERO ====== */}
      <section className="hero" ref={heroRef}>
        <div className="hero__grain" />
        <div className="hero__overlay" />
        <div className="hero__content">
          <p className="hero__eyebrow section-label">New Season — SS 2026</p>
          <h1 className="hero__heading">
            <span className="hero-word" style={{ animationDelay: "0.1s" }}>
              IN
            </span>{" "}
            <span className="hero-word" style={{ animationDelay: "0.25s" }}>
              YOUR
            </span>{" "}
            <span
              className="hero-word hero-word--amber"
              style={{ animationDelay: "0.4s" }}
            >
              ELEMENT.
            </span>
          </h1>
          <p className="hero__sub" style={{ animationDelay: "0.65s" }}>
            Gear engineered for the Himalayas. Built for every summit, every
            trail, every adventure.
          </p>
          <div className="hero__ctas" style={{ animationDelay: "0.85s" }}>
            <Link to="/womens" className="btn btn-primary">
              Shop Women's
            </Link>
            <Link to="/mens" className="btn btn-secondary">
              Shop Men's
            </Link>
          </div>
        </div>
        <div className="hero__mountain-bottom">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none">
            <path
              d="M0 120L180 30L360 80L540 10L720 60L900 20L1080 70L1260 25L1440 55V120H0Z"
              fill="#FAF7F2"
            />
          </svg>
        </div>
      </section>

      {/* ====== CATEGORY PILLS ====== */}
      <section className="category-pills">
        <div className="container">
          <div className="pills-scroll">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className="pill reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURED PRODUCTS ====== */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Featured Collection</span>
            <div className="heading-reveal">
              <h2 className="section-heading heading-reveal-inner">
                Gear That Goes Further
              </h2>
            </div>
          </div>
          {loading ? (
            <div className="collection-loading">Loading products…</div>
          ) : featuredProducts.length === 0 ? (
            <div className="collection-loading">No products available yet.</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
          <div className="section-cta reveal">
            <Link to="/mens" className="btn btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ====== MOUNTAIN DIVIDER ====== */}
      <div className="mountain-divider-green">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
          <path
            d="M0 80L240 20L480 55L720 5L960 45L1200 15L1440 50V80H0Z"
            fill="#1B4332"
          />
        </svg>
      </div>

      {/* ====== STORE LOCATOR + PROMISE ====== */}
      <section className="promise-banner">
        <div className="container">
          <div className="promise-banner__inner">
            <div
              className="promise-banner__locator reveal-scale"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="promise-banner__map-wrap">
                <iframe
                  title="Shikhar Store Location"
                  src="https://www.google.com/maps?q=P886+J22+Shikhar+Outdoor,+Kathmandu,+44600&z=16&output=embed"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="promise-banner__map-content">
                <span
                  className="section-label"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Store Locator
                </span>
                <h2 className="section-heading light">
                  Less Waste.
                  <br />
                  More Adventure.
                </h2>
                <p>
                  Every piece we make is built to last, repaired when it wears,
                  and renewed before it retires. Because the mountains deserve
                  better.
                </p>
                <div className="promise-banner__btns">
                  <button className="btn btn-amber">Shop Renewed</button>
                  <button className="btn btn-outline-light">Trade In</button>
                  <a
                    className="btn btn-outline-light"
                    href="https://www.google.com/maps/dir/?api=1&destination=P886+J22+Shikhar+Outdoor,+Kathmandu,+44600"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
            <div
              className="promise-banner__visual reveal-scale"
              style={{ transitionDelay: "0.15s" }}
            >
              <span className="promise-orbit promise-orbit--one" />
              <span className="promise-orbit promise-orbit--two" />
              <svg viewBox="0 0 400 400" fill="none">
                <circle cx="200" cy="200" r="190" stroke="rgba(217,119,6,0.2)" strokeWidth="1" />
                <circle cx="200" cy="200" r="150" stroke="rgba(217,119,6,0.15)" strokeWidth="1" />
                <path d="M200 50L280 200L200 350L120 200Z" fill="rgba(217,119,6,0.08)" stroke="rgba(217,119,6,0.4)" strokeWidth="1.5" />
                <path d="M50 200L200 120L350 200L200 280Z" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <path d="M120 90L200 30L280 90L240 200L200 150L160 200Z" fill="rgba(217,119,6,0.12)" />
                <circle cx="200" cy="200" r="8" fill="rgba(217,119,6,0.6)" />
                <text x="200" y="215" textAnchor="middle" fill="rgba(217,119,6,0.8)" fontFamily="Playfair Display" fontSize="12" letterSpacing="3">SUMMIT</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <div className="mountain-divider-cream-from-green">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
          <path d="M0 0L360 50L720 10L1080 55L1440 10V80H0Z" fill="#FAF7F2" />
        </svg>
      </div>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { value: 50,      suffix: "+", label: "Countries Explored",    prefix: "" },
              { value: 1000000, suffix: "+", label: "Adventurers Geared",    prefix: "" },
              { value: 15,      suffix: "+", label: "Years on the Summit",   prefix: "" },
              { value: 200,     suffix: "+", label: "Peak Products",          prefix: "" },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-item reveal"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="stat-number">
                  <Counter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== UGC SECTION ====== */}
      <section className="ugc-section">
        <div className="container">
          <div className="ugc-header reveal">
            <span className="section-label">#NeverStopClimbing</span>
            <div className="heading-reveal">
              <h2 className="section-heading heading-reveal-inner">
                The Community Summit
              </h2>
            </div>
            <p className="ugc-sub reveal" style={{ transitionDelay: "0.15s" }}>
              Tag us in your adventure — the best shots make it here.
            </p>
          </div>
          <div className="ugc-grid">
            {[
              { gradient: "linear-gradient(135deg, #1B4332, #0d2b1e)",  label: "Himalayan Trek" },
              { gradient: "linear-gradient(135deg, #1e3a5f, #1B4332)",  label: "Summit Push" },
              { gradient: "linear-gradient(135deg, #374151, #1e3a5f)",  label: "Base Camp" },
              { gradient: "linear-gradient(135deg, #92400e, #1B4332)",  label: "Alpine Dawn" },
              { gradient: "linear-gradient(135deg, #1a202c, #374151)",  label: "Night Climb" },
              { gradient: "linear-gradient(135deg, #065f46, #1B4332)",  label: "Forest Trail" },
            ].map((item, i) => (
              <div
                key={i}
                className="ugc-item reveal"
                style={{ background: item.gradient, transitionDelay: `${i * 80}ms` }}
              >
                <div className="ugc-item__overlay">
                  <span className="ugc-item__label">{item.label}</span>
                </div>
                <svg viewBox="0 0 200 200" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}>
                  <path d="M0 200L70 70L120 130L160 50L200 100V200H0Z" fill="white" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== GEAR YOU MAY LIKE ====== */}
      <section className="more-products">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Curated for You</span>
            <div className="heading-reveal">
              <h2 className="section-heading heading-reveal-inner">
                Gear You May Like
              </h2>
            </div>
          </div>
          {!loading && moreProducts.length > 0 && (
            <div className="products-grid products-grid--4">
              {moreProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== BANNER CTA ====== */}
      <section className="cta-banner reveal-scale">
        <div className="cta-banner__bg">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" fill="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
            <path d="M0 200L180 60L360 120L540 20L720 100L900 30L1080 110L1260 40L1440 90V200H0Z" fill="white" />
          </svg>
        </div>
        <div className="container">
          <div className="cta-banner__inner">
            <span className="section-label" style={{ color: "rgba(255,255,255,0.6)" }}>Summit Season</span>
            <h2>
              Every Trail Starts
              <br />
              with the Right Gear.
            </h2>
            <p>Discover the full SHIKHAR collection — built for those who never stop.</p>
            <div className="cta-banner__btns">
              <Link to="/mens" className="btn btn-amber">Shop Men's</Link>
              <Link to="/womens" className="btn btn-secondary">Shop Women's</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CHAT WITH US ====== */}
      <section className="home-chat-section">
        <div className="container">
          <div className="home-chat-inner reveal">
            <div className="home-chat-text">
              <span className="section-label">Gear Specialists</span>
              <div className="heading-reveal">
                <h2 className="section-heading heading-reveal-inner">
                  Not Sure What You Need?
                </h2>
              </div>
              <p>
                Our mountain experts are here to help — from layering systems to
                summit packs. Tell us your trail, and we&apos;ll build your kit.
              </p>
              <ul className="home-chat-features">
                {[
                  "Personalised gear recommendations",
                  "Size & fit guidance",
                  "Bulk & expedition orders",
                  "Reply within 24 hours",
                ].map((feat) => (
                  <li key={feat}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <button className="btn btn-primary home-chat-btn" onClick={() => setChatOpen(true)}>
                Chat With Us
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <div className="home-chat-visual reveal-scale" style={{ transitionDelay: "0.15s" }}>
              <div className="chat-card-preview">
                <div className="chat-card-header">
                  <div className="chat-card-avatar">S</div>
                  <div>
                    <p className="chat-card-name">SHIKHAR Team</p>
                    <span className="chat-card-status">● Online now</span>
                  </div>
                </div>
                <div className="chat-card-bubbles">
                  <div className="chat-bubble chat-bubble--in">
                    Hi! I&apos;m planning an Everest Base Camp trek — what jacket do you recommend?
                  </div>
                  <div className="chat-bubble chat-bubble--out">
                    Great choice! For EBC, we&apos;d recommend our Himalayan Down Parka paired with the Gore-Tex Alpine Shell. Want me to put together a full kit for you?
                  </div>
                  <div className="chat-bubble chat-bubble--in">Yes please! 🏔️</div>
                </div>
                <button className="chat-card-cta" onClick={() => setChatOpen(true)}>
                  Start Your Conversation →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating Chat Button */}
      <button className="floating-chat-btn" onClick={() => setChatOpen(true)} aria-label="Chat with us">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Chat</span>
      </button>
    </main>
  );
}