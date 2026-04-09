// src\components\Footer.jsx
import { Link } from "react-router-dom";
import "./Footer.css";

const footerCols = [
  {
    heading: "Shop",
    links: ["Men's", "Women's", "Footwear", "New Arrivals", "Sale"],
    tos: ["/mens", "/womens", "/footwear", "/mens", "/mens"],
  },
  {
    heading: "Help",
    links: [
      "Shipping & Returns",
      "Size Guide",
      "Product Care",
      "FAQs",
      "Contact Us",
    ],
    tos: ["#", "#", "#", "#", "#"],
  },
  {
    heading: "About Us",
    links: ["Our Story", "Sustainability", "Careers", "Press", "Investors"],
    tos: ["/about", "/about", "#", "#", "#"],
  },
  {
    heading: "Discover",
    links: [
      "Trail Journal",
      "Athlete Stories",
      "Gear Guide",
      "Routes & Maps",
      "Community",
    ],
    tos: ["#", "#", "#", "#", "#"],
  },
  {
    heading: "Explore",
    links: [
      "Find a Store",
      "SHIKHAR Rewards",
      "Gift Cards",
      "Affiliate Program",
      "App Download",
    ],
    tos: ["#", "#", "#", "#", "#"],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Mountain Divider */}
      <div className="footer-mountain-divider">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
          <path
            d="M0 80L240 20L480 55L720 5L960 45L1200 15L1440 50V80H0Z"
            fill="#111827"
          />
        </svg>
      </div>

      <div className="footer__top">
        <div className="container">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer-logo-mark">
                <img
                  src="/vite.svg"
                  alt="Shikhar Outdoor logo"
                  className="footer-logo-img"
                />
              </span>
              <span>SHIKHAR OUTDOOR</span>
            </Link>
            <p className="footer__tagline">Conquer Every Summit</p>
            <p className="footer__desc">
              Crafted for those who seek the horizon. Premium outdoor gear built
              for Himalayan conditions and beyond.
            </p>
            <div className="footer__socials">
              {[
                {
                  name: "Instagram",
                  href: "https://www.instagram.com/shikharoutdoor",
                },
                {
                  name: "Facebook",
                  href: "https://www.facebook.com/shikharoutdoor",
                },
                { name: "WhatsApp", href: "https://wa.me/919876543210" },
                {
                  name: "YouTube",
                  href: "https://www.youtube.com/@shikharoutdoor",
                },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  className="social-link"
                  aria-label={s.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.name === "Instagram" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle
                        cx="17.5"
                        cy="6.5"
                        r="0.5"
                        fill="currentColor"
                        stroke="none"
                      />
                    </svg>
                  )}
                  {s.name === "Facebook" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  )}
                  {s.name === "WhatsApp" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                  )}
                  {s.name === "YouTube" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.29 29 29 0 0 0-.46-5.44z" />
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="footer__cols">
            {footerCols.map((col) => (
              <div key={col.heading} className="footer__col">
                <h4 className="footer__col-heading">{col.heading}</h4>
                <ul>
                  {col.links.map((link, i) => (
                    <li key={link}>
                      <Link to={col.tos[i]}>{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="footer__email-bar">
        <div className="container">
          <div className="footer__email-inner">
            <div>
              <h3>Stay on the Trail</h3>
              <p>
                Get first access to new gear, trail stories & exclusive offers.
              </p>
            </div>
            <form
              className="footer__email-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" placeholder="Your email address" />
              <button type="submit" className="btn btn-amber">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© 2026 SHIKHAR OUTDOOR. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
