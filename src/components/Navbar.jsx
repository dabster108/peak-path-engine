import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { allSearchItems, trendingSearches } from "../data/searchData";
import "./Navbar.css";

const navLinks = [
  { label: "Men's", to: "/mens" },
  { label: "Women's", to: "/womens" },
  { label: "Footwear", to: "/footwear" },
  {
    label: "Backpacks",
    to: "/backpacks",
    dropdown: [
      { label: "Day Packs", sub: "20–30L lightweight" },
      { label: "Trekking Packs", sub: "35–50L multi-day" },
      { label: "Summit Packs", sub: "55–75L expedition" },
      { label: "Duffles", sub: "Base camp carry" },
    ],
  },
  {
    label: "Equipment",
    to: "/equipment",
    dropdown: [
      { label: "Trekking Poles", sub: "Carbon & aluminium" },
      { label: "Goggles", sub: "UV400 protection" },
      { label: "Headlamps", sub: "High-lumen trail" },
      { label: "Sleeping Bags", sub: "All-season warmth" },
      { label: "Tents", sub: "Lightweight shelters" },
    ],
  },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const isHome = location.pathname === "/";

  // Derived search results
  const searchResults =
    searchQuery.trim().length > 0
      ? allSearchItems
          .filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.section.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  // Focus input when overlay opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", mobileOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [mobileOpen]);

  const navClass = [
    "navbar",
    scrolled || !isHome ? "navbar--solid" : "navbar--transparent",
    scrolled ? "navbar--shrunk" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className="announcement-bar">
        Free shipping on orders over ₹2999 &nbsp;|&nbsp;{" "}
        <span>Join SHIKHAR REWARDS</span>
      </div>
      <nav className={navClass}>
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="logo-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polygon
                  points="14,2 26,24 2,24"
                  fill="currentColor"
                  opacity="0.9"
                />
                <polygon points="14,8 21,24 7,24" fill="white" opacity="0.3" />
              </svg>
            </span>
            <span className="logo-text">SHIKHAR</span>
          </Link>

          {/* Center Nav */}
          <ul className="navbar__links">
            {navLinks.map((link, i) => (
              <li
                key={link.to}
                style={{ animationDelay: `${i * 80}ms` }}
                className={link.dropdown ? "has-dropdown" : ""}
                onMouseEnter={() => link.dropdown && setOpenDropdown(link.to)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={link.to}
                  className={`navbar__link ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.label}
                  {link.dropdown && (
                    <svg
                      className={`dropdown-chevron${openDropdown === link.to ? " open" : ""}`}
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                    >
                      <path
                        d="M1 1l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Link>
                {link.dropdown && (
                  <div
                    className={`nav-dropdown${openDropdown === link.to ? " open" : ""}`}
                  >
                    <div className="nav-dropdown__inner">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          to={link.to}
                          className="nav-dropdown__item"
                        >
                          <span className="nav-dropdown__item-name">
                            {item.label}
                          </span>
                          <span className="nav-dropdown__item-sub">
                            {item.sub}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Right Icons */}
          <div className="navbar__actions">
            <button
              className={`navbar__icon-btn${searchOpen ? " search-active" : ""}`}
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className="navbar__icon-btn cart-btn" aria-label="Cart">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button
              className={`hamburger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-drawer__header">
          <Link to="/" className="navbar__logo">
            <span className="logo-mark">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,24 2,24" fill="currentColor" />
              </svg>
            </span>
            <span className="logo-text">SHIKHAR</span>
          </Link>
          <button className="drawer-close" onClick={() => setMobileOpen(false)}>
            ✕
          </button>
        </div>
        <ul className="mobile-drawer__links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={location.pathname === link.to ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-drawer__footer">
          <p className="section-label">Conquer Every Summit</p>
        </div>
      </div>
      {mobileOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* ====== Search Overlay ====== */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div
            className="search-overlay__panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="search-overlay__bar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="search-overlay__icon"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchInputRef}
                className="search-overlay__input"
                type="text"
                placeholder="Search gear, jackets, packs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchResults.length > 0) {
                    navigate(searchResults[0].to);
                    setSearchOpen(false);
                  }
                }}
                autoComplete="off"
                spellCheck="false"
              />
              {searchQuery && (
                <button
                  className="search-overlay__clear"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                className="search-overlay__close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
                <span>ESC</span>
              </button>
            </div>

            {/* Results */}
            {searchQuery.trim().length > 0 ? (
              <div className="search-overlay__results">
                {searchResults.length > 0 ? (
                  <>
                    <p className="search-overlay__results-label">
                      {searchResults.length} result
                      {searchResults.length !== 1 ? "s" : ""} for &ldquo;
                      {searchQuery}&rdquo;
                    </p>
                    <ul className="search-overlay__list">
                      {searchResults.map((item, i) => (
                        <li key={i}>
                          <Link to={item.to} className="search-result-item">
                            <div className="search-result-item__icon">
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                              </svg>
                            </div>
                            <div className="search-result-item__text">
                              <span className="search-result-item__name">
                                {item.name}
                              </span>
                              <span className="search-result-item__meta">
                                {item.section} · {item.category}
                                {item.price
                                  ? ` · ₹${item.price.toLocaleString("en-IN")}`
                                  : ""}
                              </span>
                            </div>
                            <svg
                              className="search-result-item__arrow"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="search-overlay__empty">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <p>No results for &ldquo;{searchQuery}&rdquo;</p>
                    <span>
                      Try searching for jacket, socks, poles, or a specific
                      product name.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-overlay__trending">
                <p className="search-overlay__results-label">
                  Trending Searches
                </p>
                <div className="search-trending-pills">
                  {trendingSearches.map((term) => (
                    <button
                      key={term}
                      className="search-trending-pill"
                      onClick={() => setSearchQuery(term)}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
                      </svg>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
