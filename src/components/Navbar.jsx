import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const navLinks = [
  { label: "Men's", to: "/mens" },
  { label: "Women's", to: "/womens" },
  { label: "Footwear", to: "/footwear" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount] = useState(0);
  const location = useLocation();
  const isHome = location.pathname === "/";

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
              <li key={link.to} style={{ animationDelay: `${i * 80}ms` }}>
                <Link
                  to={link.to}
                  className={`navbar__link ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Icons */}
          <div className="navbar__actions">
            <button className="navbar__icon-btn" aria-label="Search">
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
    </>
  );
}
