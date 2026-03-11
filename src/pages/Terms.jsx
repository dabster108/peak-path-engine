import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./Terms.css";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="terms-page">
      {/* Hero */}
      <div className="terms-hero">
        <div className="terms-hero__inner">
          <span className="eyebrow" style={{ color: "var(--color-amber)" }}>
            Legal
          </span>
          <h1>Terms &amp; Conditions</h1>
          <p>Last updated: January 2026</p>
        </div>
      </div>

      <div className="terms-body container">
        {/* ====== SECTION 1: WARRANTY POLICY ====== */}
        <section className="terms-section" id="warranty">
          <div className="terms-section__label">Section 01</div>
          <h2>Warranty Policy</h2>
          <p className="terms-intro">
            We build gear that lasts — and we back it up. Here's exactly what
            our warranty covers, in plain English.
          </p>

          <div className="warranty-overview">
            <div className="warranty-badge">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <strong>2-Year Warranty</strong>
              <span>on all SHIKHAR products</span>
            </div>
          </div>

          <div className="warranty-blocks">
            <div className="warranty-block warranty-block--yes">
              <h3>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                What We Cover
              </h3>
              <ul>
                <li>
                  Manufacturing defects — anything that went wrong during
                  production
                </li>
                <li>Faulty or broken zips, buckles, and hardware</li>
                <li>Stitching failures under normal use</li>
                <li>Delamination of fabrics (e.g. Gore-Tex layers peeling)</li>
                <li>
                  Waterproofing failure that isn't caused by wear or damage
                </li>
                <li>
                  Structural failure of poles, frames, or load-bearing
                  components
                </li>
              </ul>
            </div>

            <div className="warranty-block warranty-block--no">
              <h3>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                What's Not Covered
              </h3>
              <ul>
                <li>
                  Normal wear and tear — fading, pilling, abrasion over time
                </li>
                <li>Damage from accidents, misuse, or user negligence</li>
                <li>Improper washing or care (always check the care label)</li>
                <li>
                  Modifications or repairs done by anyone other than SHIKHAR
                </li>
                <li>Lost or stolen products</li>
                <li>Products purchased from unauthorised sellers</li>
              </ul>
            </div>
          </div>

          <div className="warranty-claim-box">
            <h3>How to Make a Claim — 3 Easy Steps</h3>
            <div className="claim-steps">
              <div className="claim-step">
                <span className="step-num">1</span>
                <div>
                  <strong>Email us</strong>
                  <p>
                    Send a message to{" "}
                    <a href="mailto:hello@shikharoutdoor.com">
                      hello@shikharoutdoor.com
                    </a>{" "}
                    with your order number and a brief description of the issue.
                  </p>
                </div>
              </div>
              <div className="claim-step">
                <span className="step-num">2</span>
                <div>
                  <strong>Send photos</strong>
                  <p>
                    Attach clear photos of the defect. This helps us assess the
                    claim quickly — usually within 48 hours.
                  </p>
                </div>
              </div>
              <div className="claim-step">
                <span className="step-num">3</span>
                <div>
                  <strong>Choose your resolution</strong>
                  <p>
                    For valid claims we'll offer a repair, replacement, or full
                    refund — your choice. We cover return shipping.
                  </p>
                </div>
              </div>
            </div>
            <p className="claim-note">
              Warranty is only valid with proof of purchase from SHIKHAR or an
              authorised retailer.
            </p>
          </div>
        </section>

        {/* ====== SECTION 2: TERMS & CONDITIONS ====== */}
        <section className="terms-section" id="terms">
          <div className="terms-section__label">Section 02</div>
          <h2>Terms &amp; Conditions</h2>
          <p className="terms-intro">
            By using our website or purchasing our products, you agree to the
            following terms. We've kept the language as clear as possible.
          </p>

          <div className="terms-blocks">
            <div className="terms-block">
              <h3>1. About Us</h3>
              <p>
                SHIKHAR OUTDOOR ("we", "us", "our") is a premium outdoor gear
                brand based in India. Our website at{" "}
                <strong>shikharoutdoor.com</strong> is operated by SHIKHAR
                OUTDOOR Pvt. Ltd.
              </p>
            </div>

            <div className="terms-block">
              <h3>2. Using Our Website</h3>
              <p>
                You may browse and purchase from our website for personal,
                non-commercial use. You agree not to:
              </p>
              <ul>
                <li>Use the site for any unlawful purpose</li>
                <li>
                  Scrape, copy, or reproduce our content without permission
                </li>
                <li>Interfere with the security or performance of the site</li>
                <li>Misrepresent your identity or purchase intent</li>
              </ul>
            </div>

            <div className="terms-block">
              <h3>3. Orders &amp; Payments</h3>
              <p>
                All prices are listed in Indian Rupees (INR) and include
                applicable taxes. We reserve the right to cancel or refuse any
                order at our discretion — for example, if a product was listed
                at an incorrect price due to a technical error. You'll always be
                notified and refunded promptly in such cases.
              </p>
            </div>

            <div className="terms-block">
              <h3>4. Shipping &amp; Delivery</h3>
              <p>
                We ship across India and to select international destinations.
                Delivery times are estimates — we work with trusted carriers,
                but delays can happen due to weather, customs, or events outside
                our control. We'll always keep you updated.
              </p>
            </div>

            <div className="terms-block">
              <h3>5. Returns &amp; Refunds</h3>
              <p>
                Not happy? Return any unused, unwashed item in its original
                packaging within <strong>30 days</strong> of delivery for a full
                refund or exchange. Worn or washed items cannot be returned
                unless they have a manufacturing defect (see our Warranty Policy
                above). Refunds are processed within 7–10 business days.
              </p>
            </div>

            <div className="terms-block">
              <h3>6. Product Information</h3>
              <p>
                We work hard to make sure product images, descriptions, and
                specifications are accurate. However, colours may appear
                slightly different on different screens. We reserve the right to
                update product details at any time without prior notice.
              </p>
            </div>

            <div className="terms-block">
              <h3>7. Intellectual Property</h3>
              <p>
                All content on this website — including logos, images, copy, and
                design — is the property of SHIKHAR OUTDOOR and is protected by
                applicable copyright and trade mark laws. You may not reproduce,
                distribute, or create derivative works from our content without
                written permission.
              </p>
            </div>

            <div className="terms-block">
              <h3>8. Limitation of Liability</h3>
              <p>
                SHIKHAR OUTDOOR will not be liable for indirect, incidental, or
                consequential damages arising from the use (or inability to use)
                our products or website. Our total liability for any claim is
                limited to the purchase price of the product in question.
              </p>
            </div>

            <div className="terms-block">
              <h3>9. Privacy</h3>
              <p>
                We take your privacy seriously. We collect only the information
                needed to process your order and improve your experience. We do
                not sell your data to third parties. By using our site you
                consent to our data practices.
              </p>
            </div>

            <div className="terms-block">
              <h3>10. Governing Law</h3>
              <p>
                These terms are governed by the laws of India. Any disputes will
                be subject to the exclusive jurisdiction of the courts in India.
              </p>
            </div>

            <div className="terms-block">
              <h3>11. Changes to These Terms</h3>
              <p>
                We may update these terms from time to time. The "Last updated"
                date at the top of this page will always reflect the most recent
                version. Continued use of our site after changes constitutes
                your acceptance.
              </p>
            </div>

            <div className="terms-block">
              <h3>12. Contact</h3>
              <p>
                Questions about these terms? Get in touch:{" "}
                <a href="mailto:hello@shikharoutdoor.com">
                  hello@shikharoutdoor.com
                </a>
              </p>
            </div>
          </div>
        </section>

        <div className="terms-footer-cta">
          <p>Didn't find what you were looking for?</p>
          <Link to="/about" className="btn btn-outline">
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
