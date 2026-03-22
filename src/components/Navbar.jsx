// src\components\Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { allSearchItems, trendingSearches } from "../data/searchData";
import { isAuthenticated, setAuth } from "../App";
import { formatNpr } from "../utils/currency";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import "./Navbar.css";

const navLinks = [
  {
    label: "Men's",
    to: "/mens",
    dropdown: [
      { label: "Hiking Pants", sub: "Trail & summit pants" },
      { label: "Down Jackets", sub: "Insulated & packable" },
      { label: "Goretex", sub: "Waterproof shells" },
      { label: "Buffs", sub: "Neck gaiters & balaclavas" },
      { label: "Socks", sub: "Merino & cushioned" },
      { label: "T-Shirts", sub: "DryFit & merino base" },
      { label: "Goggles", sub: "UV400 protection" },
      { label: "Trekking Poles", sub: "Carbon & aluminium" },
    ],
  },
  {
    label: "Women's",
    to: "/womens",
    dropdown: [
      { label: "Hiking Pants", sub: "Trail & summit pants" },
      { label: "Down Jackets", sub: "Insulated & packable" },
      { label: "Goretex", sub: "Waterproof shells" },
      { label: "Buffs", sub: "Neck gaiters & warmers" },
      { label: "Socks", sub: "Merino & coolmax" },
      { label: "T-Shirts", sub: "DryFit & merino base" },
      { label: "Goggles", sub: "UV400 protection" },
      { label: "Trekking Poles", sub: "Ultralight carbon" },
    ],
  },
  {
    label: "Gore-Tex",
    to: "/goretex",
    dropdown: [
      { label: "Men's Jackets", sub: "Hardshells & anoraks" },
      { label: "Women's Jackets", sub: "Shells & storm wear" },
      { label: "Pants", sub: "Waterproof trail pants" },
      { label: "Rain Sets", sub: "Jacket + pants combos" },
      { label: "Raincoats", sub: "Ultralight packables" },
      { label: "Shoe Covers", sub: "Gaiters & overboots" },
      { label: "Socks", sub: "Waterproof socks" },
    ],
  },
  {
    label: "Footwear",
    to: "/footwear",
    dropdown: [
      { label: "Trail Running Shoes", sub: "Grip & cushion" },
      { label: "Trekking Boots", sub: "Ankle support & waterproof" },
      { label: "Summit Boots", sub: "High-altitude crampon-ready" },
      { label: "Camp Sandals", sub: "Post-hike recovery" },
      { label: "Gaiters", sub: "Snow & mud protection" },
    ],
  },
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
    label: "Bottles",
    to: "/bottles",
    dropdown: [
      { label: "Hydra Pack", sub: "Hands-free hydration bladders" },
      { label: "Filter Bottles", sub: "Clean water anywhere" },
      { label: "Water Bottles 100ml", sub: "Ultralight summit carry" },
      { label: "Water Bottles 500ml", sub: "Trail & everyday use" },
      { label: "Flask & Thermos", sub: "Vacuum-insulated hot & cold" },
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
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const cartRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const isHome = location.pathname === "/";
  const { user, displayName, clearUser } = useUser();
  const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } =
    useCart();
  const { placeOrder } = useOrders();
  const avatarLetter = (displayName || "U").charAt(0).toUpperCase();
  const userEmail = user?.email || "no-email@shikhar.local";

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const createdOrder = await placeOrder(); 
    if (!createdOrder) return;

    // Cart is cleared server-side; sync local state
    clearCart();
    setCartOpen(false);
    navigate(`/orders?orderId=${createdOrder.id}`);
  };

  // Close profile dropdown and cart on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close profile dropdown and cart on route change
  useEffect(() => {
    setProfileOpen(false);
    setCartOpen(false);
  }, [location]);

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
        Free shipping on orders over {formatNpr(2999)} &nbsp;|&nbsp;{" "}
        <span>Join SHIKHAR REWARDS</span>
      </div>
      <nav className={navClass}>
        <div className="navbar__inner">
          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <span className="logo-mark">
              <img src="/image.png" alt="Shikhar Logo" className="logo-img" />
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
            {/* Profile / Login icon */}
            <div className="profile-menu-wrap" ref={profileRef}>
              <button
                className="navbar__icon-btn profile-icon-btn"
                aria-label="Account"
                onClick={() =>
                  isAuthenticated()
                    ? setProfileOpen((v) => !v)
                    : navigate("/login")
                }
              >
                {isAuthenticated() ? (
                  <span className="profile-avatar">
                    {avatarLetter}
                    <span className="profile-online-dot" />
                  </span>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </button>

              {/* Dropdown — only shown when logged in */}
              {isAuthenticated() && (
                <div
                  className={`profile-dropdown${profileOpen ? " open" : ""}`}
                >
                  {/* Profile header */}
                  <div className="profile-dropdown__header">
                    <div className="profile-dropdown__avatar">
                      {avatarLetter}
                    </div>
                    <div className="profile-dropdown__info">
                      <div className="profile-dropdown__name">
                        {displayName || "Adventurer"}
                      </div>
                      <div className="profile-dropdown__email">{userEmail}</div>
                    </div>
                  </div>

                  <div className="profile-dropdown__divider" />

                  {/* Menu items */}
                  <button
                    className="profile-dropdown__item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/profile");
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </button>

                  <button
                    className="profile-dropdown__item"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/orders");
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    My Orders
                  </button>

                  <div className="profile-dropdown__divider" />

                  <button
                    className="profile-dropdown__item profile-dropdown__item--danger"
                    onClick={() => {
                      setAuth(false);
                      clearUser();
                      setProfileOpen(false);
                      navigate("/login");
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            <button
              className={`navbar__icon-btn cart-btn${cartOpen ? " active" : ""}`}
              aria-label="Cart"
              onClick={() => setCartOpen((prev) => !prev)}
            >
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
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
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
              <img src="/image.png" alt="Shikhar Logo" className="logo-img" />
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
            <li key={link.to} className={link.dropdown ? "has-accordion" : ""}>
              {link.dropdown ? (
                <>
                  <button
                    className={`mobile-accordion-btn${mobileAccordion === link.to ? " open" : ""}${location.pathname === link.to ? " active" : ""}`}
                    onClick={() =>
                      setMobileAccordion(
                        mobileAccordion === link.to ? null : link.to,
                      )
                    }
                  >
                    {link.label}
                    <svg
                      className={`accordion-chevron${mobileAccordion === link.to ? " open" : ""}`}
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
                  </button>
                  {mobileAccordion === link.to && (
                    <ul className="mobile-accordion__items">
                      {link.dropdown.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={link.to}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="mobile-accordion__name">
                              {item.label}
                            </span>
                            <span className="mobile-accordion__sub">
                              {item.sub}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={link.to}
                  className={location.pathname === link.to ? "active" : ""}
                >
                  {link.label}
                </Link>
              )}
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
                                  ? ` · ${formatNpr(item.price)}`
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

      <aside className={`cart-panel${cartOpen ? " open" : ""}`} ref={cartRef}>
        <div className="cart-panel__header">
          <div>
            <p className="cart-panel__eyebrow">Your Cart</p>
            <h3>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </h3>
          </div>
          <button
            type="button"
            className="cart-panel__close"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cart-panel__body">
          {items.length === 0 ? (
            <div className="cart-panel__empty">
              <p>Your cart is empty.</p>
              <span>Add products from any collection to see them here.</span>
            </div>
          ) : (
            <ul className="cart-panel__list">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}`} className="cart-item">
                  <div className="cart-item__top">
                    <div>
                      <h4>{item.name}</h4>
                      <p>
                        {item.category} · Size {item.size}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id, item.size)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item__bottom">
                    <div className="cart-item__qty">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <strong>{formatNpr(item.price * item.quantity)}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cart-panel__footer">
          <div className="cart-panel__subtotal">
            <span>Subtotal</span>
            <strong>{formatNpr(subtotal)}</strong>
          </div>
          <button
            type="button"
            className="cart-panel__checkout"
            disabled={items.length === 0}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </aside>
      {cartOpen && (
        <div
          className="cart-panel__backdrop"
          onClick={() => setCartOpen(false)}
        />
      )}
    </>
  );
}
