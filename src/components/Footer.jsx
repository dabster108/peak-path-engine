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
                <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                  <polygon points="14,2 26,24 2,24" fill="#D97706" />
                  <polygon
                    points="14,8 21,24 7,24"
                    fill="rgba(255,255,255,0.2)"
                  />
                </svg>
              </span>
              <span>SHIKHAR OUTDOOR</span>
            </Link>
            <p className="footer__tagline">Conquer Every Summit</p>
            <p className="footer__desc">
              Crafted for those who seek the horizon. Premium outdoor gear built
              for Himalayan conditions and beyond.
            </p>
            <div className="footer__socials">
              {["Instagram", "Twitter", "YouTube", "Strava"].map((s) => (
                <a key={s} href="#" className="social-link" aria-label={s}>
                  {s === "Instagram" && (
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
                  {s === "Twitter" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 5.667zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                  {s === "YouTube" && (
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
                  {s === "Strava" && (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
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
            <a href="#">Terms of Use</a>
            <a href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
