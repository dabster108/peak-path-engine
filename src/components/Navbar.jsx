// src\components\Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, setAuth } from "../App";
import { formatNpr } from "../utils/currency";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useNavSections } from "../hooks/useNavSections";
import api from "../utils/api";
import "./Navbar.css";

const SECTION_ROUTE_MAP = {
  "gore-tex":  "/goretex",
  "goretex":   "/goretex",
  footwear:    "/footwear",
  backpacks:   "/backpacks",
  bottles:     "/bottles",
  equipment:   "/equipment",
};

function getSectionRoute(sectionName) {
  return SECTION_ROUTE_MAP[sectionName.toLowerCase()] || `/${sectionName.toLowerCase()}`;
}

export default function Navbar() {
  const [scrolled, setScrolled]               = useState(false);
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [openDropdown, setOpenDropdown]       = useState(null);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [searchOpen, setSearchOpen]           = useState(false);
  const [searchQuery, setSearchQuery]         = useState("");
  const [searchResults, setSearchResults]     = useState([]);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [cartOpen, setCartOpen]               = useState(false);
  const [profileOpen, setProfileOpen]         = useState(false);

  const profileRef     = useRef(null);
  const cartRef        = useRef(null);
  const searchInputRef = useRef(null);
  const searchDebounce = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isHome   = location.pathname === "/";

  const { user, displayName, clearUser, isAdmin } = useUser();
  const { items, itemCount, subtotal, removeItem, updateQuantity, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { navSections, allSections } = useNavSections();

  const avatarLetter = (displayName || "U").charAt(0).toUpperCase();
  const userEmail    = user?.email || "";

  // ── Build nav links ────────────────────────────────────────
  const dynamicNavLinks = [
    {
      label: "Men's",
      to: "/mens",
      dropdown: allSections.map((s) => ({
        label: s.name,
        sub:   s.sub_sections?.[0]?.description || s.name,
        to:    "/mens",
        state: { filterSection: s.name },
      })),
    },
    {
      label: "Women's",
      to: "/womens",
      dropdown: allSections.map((s) => ({
        label: s.name,
        sub:   s.sub_sections?.[0]?.description || s.name,
        to:    "/womens",
        state: { filterSection: s.name },
      })),
    },
    ...navSections.map((section) => ({
      label:    section.name,
      to:       getSectionRoute(section.name),
      dropdown: section.sub_sections?.map((sub) => ({
        label: sub.name,
        sub:   sub.description || sub.name,
        to:    getSectionRoute(section.name),
      })) || [],
    })),
    { label: "Blog",  to: "/blog" },
    { label: "About", to: "/about" },
  ];

  // ── Checkout ───────────────────────────────────────────────
  async function handleCheckout() {
    if (items.length === 0) return;
    const createdOrder = await placeOrder();
    if (!createdOrder) return;
    clearCart();
    setCartOpen(false);
    navigate(`/orders?orderId=${createdOrder.id}`);
  }

  // ── Trending searches ──────────────────────────────────────
  useEffect(() => {
    api.get("sections/").then((res) => {
      // sections/ is not paginated so res.data is a plain array
      setTrendingSearches(res.data.slice(0, 6).map((s) => s.name));
    }).catch(() => {});
  }, []);

  // ── Search with debounce ───────────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchDebounce.current);
    setSearchLoading(true);
    searchDebounce.current = setTimeout(() => {
      api.get("products/").then((res) => {
        // FIX: paginated response — unwrap results array
        const raw = res.data.results ?? res.data;
        const q = searchQuery.toLowerCase();
        setSearchResults(
          raw
            .filter((p) =>
              p.name.toLowerCase().includes(q) ||
              (p.category || "").toLowerCase().includes(q) ||
              (p.section  || "").toLowerCase().includes(q)
            )
            .slice(0, 8)
            .map((p) => ({
              id:       p.id,
              name:     p.name,
              category: p.category || "",
              section:  p.section  || "",
              price:    parseFloat(p.price),
              to:       getSectionRoute(p.section || ""),
            }))
        );
      }).catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 300);
    return () => clearTimeout(searchDebounce.current);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else { setSearchQuery(""); setSearchResults([]); }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    if (searchOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchOpen]);

  // ── Outside click ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (cartRef.current    && !cartRef.current.contains(e.target))    setCartOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Route change cleanup ───────────────────────────────────
  useEffect(() => {
    setProfileOpen(false);
    setCartOpen(false);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [location]);

  // ── Scroll ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // ── Body scroll lock ───────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle("no-scroll", mobileOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [mobileOpen]);

  const navClass = [
    "navbar",
    scrolled || !isHome ? "navbar--solid" : "navbar--transparent",
    scrolled ? "navbar--shrunk" : "",
  ].filter(Boolean).join(" ");

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
              <img src="/vite.svg" alt="Shikhar Logo" className="logo-img"/>
            </span>
            <span className="logo-text">SHIKHAR</span>
          </Link>

          {/* Center Nav */}
          <ul className="navbar__links">
            {dynamicNavLinks.map((link, i) => (
              <li
                key={link.to + link.label}
                style={{ animationDelay: `${i * 80}ms` }}
                className={link.dropdown?.length ? "has-dropdown" : ""}
                onMouseEnter={() => link.dropdown?.length && setOpenDropdown(link.to + link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={link.to}
                  className={`navbar__link ${location.pathname === link.to ? "active" : ""}`}
                >
                  {link.label}
                  {link.dropdown?.length > 0 && (
                    <svg
                      className={`dropdown-chevron${openDropdown === link.to + link.label ? " open" : ""}`}
                      width="10" height="6" viewBox="0 0 10 6" fill="none"
                    >
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </Link>

                {link.dropdown?.length > 0 && (
                  <div className={`nav-dropdown${openDropdown === link.to + link.label ? " open" : ""}`}>
                    <div className="nav-dropdown__inner">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          to={item.to || link.to}
                          state={item.state || undefined}
                          className="nav-dropdown__item"
                        >
                          <span className="nav-dropdown__item-name">{item.label}</span>
                          <span className="nav-dropdown__item-sub">{item.sub}</span>
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
            {/* Search */}
            <button
              className={`navbar__icon-btn${searchOpen ? " search-active" : ""}`}
              aria-label="Search" onClick={() => setSearchOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Profile */}
            <div className="profile-menu-wrap" ref={profileRef}>
              <button
                className="navbar__icon-btn profile-icon-btn"
                aria-label="Account"
                onClick={() => isAuthenticated() ? setProfileOpen((v) => !v) : navigate("/login")}
              >
                {isAuthenticated() ? (
                  <span className="profile-avatar">
                    {avatarLetter}
                    <span className="profile-online-dot"/>
                  </span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
              </button>

              {isAuthenticated() && (
                <div className={`profile-dropdown${profileOpen ? " open" : ""}`}>
                  <div className="profile-dropdown__header">
                    <div className="profile-dropdown__avatar">{avatarLetter}</div>
                    <div className="profile-dropdown__info">
                      <div className="profile-dropdown__name">{displayName || "Adventurer"}</div>
                      <div className="profile-dropdown__email">{userEmail}</div>
                    </div>
                  </div>

                  <div className="profile-dropdown__divider"/>

                  <button className="profile-dropdown__item"
                    onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    My Profile
                  </button>

                  <button className="profile-dropdown__item"
                    onClick={() => { setProfileOpen(false); navigate("/orders"); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    My Orders
                  </button>

                  {isAdmin && (
                    <button className="profile-dropdown__item profile-dropdown__item--admin"
                      onClick={() => { setProfileOpen(false); navigate("/admin"); }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                      </svg>
                      Admin
                      <span className="profile-dropdown__admin-arrow">-&gt;</span>
                    </button>
                  )}

                  <div className="profile-dropdown__divider"/>

                  <button className="profile-dropdown__item profile-dropdown__item--danger"
                    onClick={() => { setAuth(false); clearUser(); setProfileOpen(false); navigate("/login"); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              className={`navbar__icon-btn cart-btn${cartOpen ? " active" : ""}`}
              aria-label="Cart" onClick={() => setCartOpen((prev) => !prev)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            {/* Hamburger */}
            <button
              className={`hamburger ${mobileOpen ? "open" : ""}`}
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu"
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-drawer__header">
          <Link to="/" className="navbar__logo">
            <span className="logo-mark">
              <img src="/vite.svg" alt="Shikhar Logo" className="logo-img"/>
            </span>
            <span className="logo-text">SHIKHAR</span>
          </Link>
          <button className="drawer-close" onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        <ul className="mobile-drawer__links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link>
          </li>
          {dynamicNavLinks.map((link) => (
            <li key={link.to + link.label} className={link.dropdown?.length ? "has-accordion" : ""}>
              {link.dropdown?.length ? (
                <>
                  <button
                    className={`mobile-accordion-btn${mobileAccordion === link.to + link.label ? " open" : ""}${location.pathname === link.to ? " active" : ""}`}
                    onClick={() => setMobileAccordion(
                      mobileAccordion === link.to + link.label ? null : link.to + link.label
                    )}
                  >
                    {link.label}
                    <svg
                      className={`accordion-chevron${mobileAccordion === link.to + link.label ? " open" : ""}`}
                      width="10" height="6" viewBox="0 0 10 6" fill="none"
                    >
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {mobileAccordion === link.to + link.label && (
                    <ul className="mobile-accordion__items">
                      {link.dropdown.map((item) => (
                        <li key={item.label}>
                          <Link
                            to={item.to || link.to}
                            state={item.state || undefined}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="mobile-accordion__name">{item.label}</span>
                            <span className="mobile-accordion__sub">{item.sub}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={link.to} className={location.pathname === link.to ? "active" : ""}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="mobile-drawer__footer">
          {isAdmin && (
            <Link to="/admin" className="mobile-drawer__admin-link" onClick={() => setMobileOpen(false)}>
              Admin Panel <span aria-hidden="true">-&gt;</span>
            </Link>
          )}
          <p className="section-label">Conquer Every Summit</p>
        </div>
      </div>
      {mobileOpen && <div className="drawer-backdrop" onClick={() => setMobileOpen(false)}/>}

      {/* ── Search Overlay ────────────────────────────────── */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-overlay__panel" onClick={(e) => e.stopPropagation()}>
            <div className="search-overlay__bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" className="search-overlay__icon">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
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
                <button className="search-overlay__clear" aria-label="Clear"
                  onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
              <button className="search-overlay__close" aria-label="Close search"
                onClick={() => setSearchOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
                <span>ESC</span>
              </button>
            </div>

            {searchQuery.trim().length > 0 ? (
              <div className="search-overlay__results">
                {searchLoading ? (
                  <p className="search-overlay__results-label">Searching…</p>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="search-overlay__results-label">
                      {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <ul className="search-overlay__list">
                      {searchResults.map((item) => (
                        <li key={item.id}>
                          <Link to={item.to} className="search-result-item"
                            onClick={() => setSearchOpen(false)}>
                            <div className="search-result-item__icon">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                              </svg>
                            </div>
                            <div className="search-result-item__text">
                              <span className="search-result-item__name">{item.name}</span>
                              <span className="search-result-item__meta">
                                {item.section} · {item.category}
                                {item.price ? ` · ${formatNpr(item.price)}` : ""}
                              </span>
                            </div>
                            <svg className="search-result-item__arrow" width="14" height="14"
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="search-overlay__empty">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p>No results for &ldquo;{searchQuery}&rdquo;</p>
                    <span>Try searching for jacket, socks, poles, or a specific product name.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="search-overlay__trending">
                <p className="search-overlay__results-label">Trending Searches</p>
                <div className="search-trending-pills">
                  {trendingSearches.map((term) => (
                    <button key={term} className="search-trending-pill"
                      onClick={() => setSearchQuery(term)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9z"/>
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

      {/* ── Cart Panel ────────────────────────────────────── */}
      <aside className={`cart-panel${cartOpen ? " open" : ""}`} ref={cartRef}>
        <div className="cart-panel__header">
          <div>
            <p className="cart-panel__eyebrow">Your Cart</p>
            <h3>{itemCount} item{itemCount === 1 ? "" : "s"}</h3>
          </div>
          <button type="button" className="cart-panel__close"
            onClick={() => setCartOpen(false)} aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
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
                      <p>{item.category} · Size {item.size}</p>
                    </div>
                    <button type="button" className="cart-item__remove"
                      onClick={() => removeItem(item.id, item.size)}>
                      Remove
                    </button>
                  </div>
                  <div className="cart-item__bottom">
                    <div className="cart-item__qty">
                      <button type="button" aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" aria-label="Increase quantity"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
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
          <button type="button" className="cart-panel__checkout"
            disabled={items.length === 0} onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </aside>
      {cartOpen && <div className="cart-panel__backdrop" onClick={() => setCartOpen(false)}/>}
    </>
  );
}