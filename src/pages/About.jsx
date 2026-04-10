import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimations } from "../hooks/useScrollAnimations";
import { useUser } from "../context/UserContext";
import api from "../utils/api";
import "./About.css";

const team = [
  { name: "Arjun Mehta",   role: "Founder & CEO",          gradient: "linear-gradient(135deg, #1B4332, #0d2b1e)" },
  { name: "Priya Sharma",  role: "Head of Design",          gradient: "linear-gradient(135deg, #3b1f5e, #1e1b4b)" },
  { name: "Vikram Patel",  role: "Chief of Expeditions",    gradient: "linear-gradient(135deg, #92400e, #744210)" },
  { name: "Ananya Singh",  role: "Sustainability Lead",     gradient: "linear-gradient(135deg, #1e3a5f, #1B4332)" },
];

const values = [
  { icon: "⛰", title: "Built for the Mountains",  desc: "Every product is tested at altitude by real mountaineers before it reaches your hands." },
  { icon: "🌿", title: "Responsibly Made",         desc: "Bluesign® certified fabrics, recycled insulation, and carbon-neutral manufacturing." },
  { icon: "🤝", title: "Community First",          desc: "We give 1% of every sale to Himalayan trail conservation and local guide welfare programs." },
  { icon: "🔧", title: "Built to Last",            desc: "We repair before we replace. Our lifetime guarantee means gear that lasts like the mountains." },
];

const milestones = [
  { year: "2011", event: "Founded in Manali, Himachal Pradesh" },
  { year: "2013", event: "First summit: Stok Kangri expedition kit" },
  { year: "2016", event: "Launched women's collection" },
  { year: "2019", event: "Reached 1 lakh customers across India" },
  { year: "2022", event: "Expanded to 15 countries in Asia & Europe" },
  { year: "2024", event: "Launched SHIKHAR Renewable gear program" },
  { year: "2026", event: "Present — 1M+ adventurers and climbing strong" },
];

const productOptions = [
  "Hiking Pants", "Down Jacket", "Gore-Tex Shell", "Buff / Neck Gaiter",
  "Trekking Socks", "T-Shirt", "Goggles", "Trekking Poles",
  "Backpack", "Sleeping Bag", "Tent", "Headlamp", "Other",
];

const GRADIENTS = [
  "linear-gradient(135deg, #1B4332, #0d2b1e)",
  "linear-gradient(135deg, #1e3a5f, #1e40af)",
  "linear-gradient(135deg, #374151, #1B4332)",
  "linear-gradient(135deg, #3b1f5e, #1e1b4b)",
  "linear-gradient(135deg, #065f46, #1B4332)",
  "linear-gradient(135deg, #92400e, #744210)",
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

function StarRating({ count }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= count ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.5"
          className={s <= count ? "star-filled" : "star-empty"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ── Write Review Form (regular users only) ─────────────────
function WriteReview({ onSubmit, displayName, hasReviewed }) {
  const [form, setForm]           = useState({ name: displayName || "", location: "", product: "", rating: 0, text: "" });
  const [hover, setHover]         = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState("");
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    setForm((prev) => ({ ...prev, name: displayName || "" }));
  }, [displayName]);

  // FIX: if the backend already has a review from this user, show thank-you
  // immediately rather than letting them see the form and hit a 400 on submit
  useEffect(() => {
    if (hasReviewed) setSubmitted(true);
  }, [hasReviewed]);

  function validate() {
    const e = {};
    if (!form.name.trim())            e.name    = "Please enter your name.";
    if (!form.rating)                 e.rating  = "Please select a star rating.";
    if (!form.product)                e.product = "Please select a product.";
    if (form.text.trim().length < 20) e.text    = "Review must be at least 20 characters.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    setSaving(true);
    try {
      const res = await onSubmit({
        name:     form.name.trim(),
        location: form.location.trim(),
        product:  form.product,
        rating:   form.rating,
        text:     form.text.trim(),
      });
      if (res) setSubmitted(true);
    } catch (err) {
      const data = err?.response?.data;
      // FIX: backend returns { error: "You have already reviewed this product." }
      if (data?.error) setApiError(data.error);
      else if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        setApiError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setApiError("Failed to submit. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <div className="write-review-success">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="9 12 11 14 15 10"/>
        </svg>
        <h3>Thanks for your review!</h3>
        <p>Your experience helps other adventurers gear up right.</p>
      </div>
    );
  }

  return (
    <form className="write-review-form" onSubmit={handleSubmit} noValidate>
      <h3 className="write-review-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Share Your Experience
      </h3>

      <div className="write-review-row">
        <div className="write-review-field">
          <label>Your Name *</label>
          <input type="text" placeholder="e.g. Aryan K." value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}/>
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className="write-review-field">
          <label>City / Location</label>
          <input type="text" placeholder="e.g. Dehradun" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}/>
        </div>
      </div>

      <div className="write-review-row">
        <div className="write-review-field">
          <label>Product Reviewed *</label>
          <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
            <option value="">Select a product…</option>
            {productOptions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.product && <span className="field-error">{errors.product}</span>}
        </div>
        <div className="write-review-field">
          <label>Your Rating *</label>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg key={s} width="28" height="28" viewBox="0 0 24 24"
                fill={(hover || form.rating) >= s ? "currentColor" : "none"}
                stroke="currentColor" strokeWidth="1.5"
                className={(hover || form.rating) >= s ? "star-filled star-pick" : "star-empty star-pick"}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setForm({ ...form, rating: s })}
                style={{ cursor: "pointer" }}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
          {errors.rating && <span className="field-error">{errors.rating}</span>}
        </div>
      </div>

      <div className="write-review-field">
        <label>
          Your Review *{" "}
          <span className="char-count">{form.text.length} / 500</span>
        </label>
        <textarea rows="4" maxLength={500}
          placeholder="Tell us about your experience on the trail with this product..."
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        {errors.text && <span className="field-error">{errors.text}</span>}
      </div>

      {apiError && <p className="field-error" style={{ marginBottom: "0.5rem" }}>{apiError}</p>}

      <button type="submit" className="btn btn-amber write-review-btn" disabled={saving}>
        {saving ? "Posting…" : "Post Review"}
      </button>
    </form>
  );
}

// ── Review card ────────────────────────────────────────────
function ReviewCard({ r, i }) {
  return (
    <div className="review-card reveal"
      style={{ "--card-gradient": getGradient(i), animationDelay: `${i * 0.08}s` }}>
      <div className="review-card__top">
        <div className="review-avatar" style={{ background: getGradient(i) }}>
          {r.name.charAt(0)}
        </div>
        <div>
          <p className="review-name">{r.name}</p>
          <p className="review-meta">
            {r.location && <>{r.location} &middot; </>}{r.date}
          </p>
        </div>
      </div>
      <StarRating count={r.rating}/>
      <p className="review-product">Purchased: <strong>{r.product}</strong></p>
      <p className="review-text">&ldquo;{r.text}&rdquo;</p>
    </div>
  );
}

export default function About() {
  useScrollAnimations();
  const navigate = useNavigate();
  const { user, displayName, isAdmin } = useUser();

  const [allReviews, setAllReviews]         = useState([]);
  const [myReviews, setMyReviews]           = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError]     = useState("");
  // FIX: track whether this user already has a review in the DB
  const [hasReviewed, setHasReviewed]       = useState(false);
  const [activeReviewPanel, setActiveReviewPanel] = useState("share");

  useEffect(() => {
    api.get("about/reviews/")
      .then((res) => {
        const reviews = Array.isArray(res.data) ? res.data : [];
        setAllReviews(reviews);

        if (user && !isAdmin) {
          // FIX: AboutReview.unique_together = ('user', 'product') is enforced
          // server-side. Client-side we match on name === displayName as a
          // best-effort check so the form shows the right state on load.
          const mine = reviews.filter((r) => r.name === displayName);
          setMyReviews(mine);
          setHasReviewed(mine.length > 0);
        }
      })
      .catch(() => setReviewsError("Could not load reviews."))
      .finally(() => setReviewsLoading(false));
  }, [user, isAdmin, displayName]);

  async function handleReviewSubmit(data) {
    // FIX: POST about/reviews/ requires IsAuthenticated — api.js attaches
    // the Bearer token automatically so no extra headers needed here.
    const res = await api.post("about/reviews/", data);
    const newReview = res.data;
    setAllReviews((prev) => [newReview, ...prev]);
    setMyReviews((prev) => [newReview, ...prev]);
    setHasReviewed(true);
    return true;
  }

  const isGuest   = !user;
  const tab2Label = isAdmin ? "All Reviews" : "Your Reviews";

  // Admins land on the reviews tab since they have no share tab
  useEffect(() => {
    if (isAdmin) setActiveReviewPanel("reviews");
  }, [isAdmin]);

  // ── Reviews tab ──────────────────────────────────────────
  function renderReviewsPanel() {
    if (isAdmin) {
      return (
        <div>
          <div className="reviews-upload-cta">
            <div>
              <p className="reviews-upload-cta__title">All Customer Reviews</p>
              <p className="reviews-upload-cta__copy">
                Viewing all submitted product reviews from customers.
              </p>
            </div>
          </div>
          {renderReviewList(allReviews)}
        </div>
      );
    }

    return (
      <div>
        <div className="reviews-upload-cta">
          <div>
            <p className="reviews-upload-cta__title">Have a product experience to share?</p>
            <p className="reviews-upload-cta__copy">
              Share your review so other trekkers can choose better gear.
            </p>
          </div>
          {/* FIX: hide the CTA button if user already reviewed */}
          {!hasReviewed && !isGuest && (
            <button type="button" className="btn btn-amber reviews-upload-cta__button"
              onClick={() => setActiveReviewPanel("share")}>
              Write a Review
            </button>
          )}
        </div>
        {renderReviewList(isGuest ? allReviews : myReviews, isGuest ? "" : "your")}
      </div>
    );
  }

  function renderReviewList(reviews, scope = "") {
    if (reviewsLoading) {
      return <p style={{ color: "var(--color-text-secondary)", padding: "2rem 0" }}>Loading reviews…</p>;
    }
    if (reviewsError) {
      return <p style={{ color: "var(--color-text-danger)", padding: "1rem 0" }}>{reviewsError}</p>;
    }
    if (reviews.length === 0) {
      return (
        <p style={{ color: "var(--color-text-secondary)", padding: "2rem 0" }}>
          {scope === "your"
            ? "You haven't submitted any reviews yet."
            : "No reviews yet — be the first to share your experience."}
        </p>
      );
    }
    return (
      <div className="reviews-grid reviews-grid--switch">
        {reviews.map((r, i) => <ReviewCard key={r.id} r={r} i={i}/>)}
      </div>
    );
  }

  // ── Share tab ────────────────────────────────────────────
  function renderSharePanel() {
    if (isGuest) {
      return (
        <div className="write-review-form write-review-form--gate">
          <h3 className="write-review-title">Share Your Experience</h3>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
            You need to be signed in to leave a review.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Sign In to Review
          </button>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="write-review-form write-review-form--gate">
          <h3 className="write-review-title">Share Your Experience</h3>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Admin accounts cannot submit reviews.
          </p>
        </div>
      );
    }

    // FIX: pass hasReviewed so WriteReview immediately shows the thank-you
    // state if the user already has a review in the DB
    return (
      <WriteReview
        onSubmit={handleReviewSubmit}
        displayName={displayName}
        hasReviewed={hasReviewed}
      />
    );
  }

  return (
    <main className="about-page">
      {/* ====== HERO ====== */}
      <section className="about-hero">
        <div className="about-hero__bg"/>
        <div className="container">
          <span className="section-label">Our Story</span>
          <h1 className="about-hero__title">
            Born at&nbsp;<span className="text-amber">The Base</span> of
            <br/>Every Summit.
          </h1>
          <p className="about-hero__sub">
            SHIKHAR OUTDOOR was born from a simple frustration: gear that wasn't
            built for the places we actually climbed. So we built our own.
          </p>
        </div>
        <div className="about-hero__bottom">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
            <path d="M0 80L240 20L480 55L720 5L960 45L1200 15L1440 50V80H0Z" fill="#FAF7F2"/>
          </svg>
        </div>
      </section>

      {/* ====== BRAND STORY ====== */}
      <section className="about-story section-pad">
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__text">
              <span className="section-label reveal">How It Started</span>
              <div className="heading-reveal">
                <h2 className="heading-reveal-inner">A Pack, a Peak,<br/>and a Promise.</h2>
              </div>
              <p className="reveal" style={{ transitionDelay: "0.1s" }}>
                In 2011, our founder Arjun Mehta stood at the base of Stok Kangri with a jacket
                that had failed him for the third time. Instead of blaming the mountain, he flew
                home and started SHIKHAR from a garage in Manali.
              </p>
              <p className="reveal" style={{ transitionDelay: "0.2s" }}>
                The name says it all — Shikhar means "peak" or "summit" in Hindi. Every product
                we make carries that intent: to get you there, and bring you back.
              </p>
              <p className="reveal" style={{ transitionDelay: "0.3s" }}>
                Today, SHIKHAR gear has been trusted on Everest base camps, Kilimanjaro ascents,
                Andean treks, and weekend trails across 50+ countries.
              </p>
            </div>
            <div className="about-story__visual reveal-scale">
              <div className="about-visual-card">
                <svg viewBox="0 0 400 340" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="400" height="340" fill="url(#storyGrad)"/>
                  <path d="M0 340L80 180L160 260L240 100L320 200L400 140V340H0Z" fill="rgba(255,255,255,0.06)"/>
                  <path d="M0 340L100 200L200 280L300 120L400 190V340H0Z" fill="rgba(255,255,255,0.04)"/>
                  <path d="M240 100L270 160L265 150L300 190L240 100Z" fill="rgba(255,255,255,0.18)"/>
                  <text x="200" y="310" textAnchor="middle" fill="rgba(217,119,6,0.5)"
                    fontFamily="Playfair Display" fontSize="10" letterSpacing="6">
                    EST. MANALI 2011
                  </text>
                  <defs>
                    <linearGradient id="storyGrad" x1="0" y1="0" x2="400" y2="340">
                      <stop offset="0%" stopColor="#1B4332"/>
                      <stop offset="100%" stopColor="#0d2b1e"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="about-visual-card__label">
                  <span>Stok Kangri, 2011</span>
                  <span>Where it all began</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== VALUES ====== */}
      <section className="about-values section-pad" style={{ background: "var(--color-gray-100)" }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">What We Stand For</span>
            <div className="heading-reveal">
              <h2 className="heading-reveal-inner">Our Core Values</h2>
            </div>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={v.title} className="value-card reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="value-icon">{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TIMELINE ====== */}
      <section className="about-timeline section-pad">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">Our Journey</span>
            <div className="heading-reveal">
              <h2 className="heading-reveal-inner">Milestones on the Summit Trail</h2>
            </div>
          </div>
          <div className="timeline">
            {milestones.map((m, i) => (
              <div key={m.year}
                className={`timeline-item reveal ${i % 2 === 0 ? "left" : "right"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="timeline-content">
                  <span className="timeline-year">{m.year}</span>
                  <p>{m.event}</p>
                </div>
                <div className="timeline-dot"/>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TEAM ====== */}
      <section className="about-team section-pad" style={{ background: "var(--color-gray-100)" }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-label">The People</span>
            <div className="heading-reveal">
              <h2 className="heading-reveal-inner">The Summit Crew</h2>
            </div>
          </div>
          <div className="team-grid">
            {team.map((member, i) => (
              <div key={member.name} className="team-card reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="team-card__avatar" style={{ background: member.gradient }}>
                  <svg viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="45" r="22" fill="rgba(255,255,255,0.2)"/>
                    <ellipse cx="60" cy="100" rx="30" ry="20" fill="rgba(255,255,255,0.1)"/>
                  </svg>
                </div>
                <div className="team-card__info">
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SUSTAINABILITY ====== */}
      <section className="about-sustainability section-pad">
        <div className="container">
          <div className="sustainability-inner">
            <div className="sustainability-text reveal-left">
              <span className="section-label">Planet First</span>
              <div className="heading-reveal">
                <h2 className="heading-reveal-inner">
                  Adventure Without<br/><span className="text-amber">Compromise.</span>
                </h2>
              </div>
              <p>
                Our Himalayan Pledge commits to net-zero emissions by 2030, using 100% recycled
                or bluesign® certified materials across our full range by 2027.
              </p>
              <div className="sustainability-stats">
                <div className="sus-stat"><strong>68%</strong><span>Recycled materials used in 2025</span></div>
                <div className="sus-stat"><strong>42K+</strong><span>Items repaired instead of replaced</span></div>
                <div className="sus-stat"><strong>NPR 2.4Cr</strong><span>Donated to trail conservation</span></div>
              </div>
            </div>
            <div className="sustainability-visual reveal-scale" style={{ transitionDelay: "0.2s" }}>
              <div className="sus-visual-circle">
                <svg viewBox="0 0 300 300" fill="none">
                  <circle cx="150" cy="150" r="140" stroke="rgba(27,67,50,0.15)" strokeWidth="1"/>
                  <circle cx="150" cy="150" r="110" stroke="rgba(27,67,50,0.2)"  strokeWidth="1"/>
                  <circle cx="150" cy="150" r="80"  stroke="rgba(27,67,50,0.25)" strokeWidth="1" strokeDasharray="6 4"/>
                  <path d="M150 10L165 80L220 30L175 90L230 100L175 110L220 170L165 120L150 190L135 120L80 170L125 110L70 100L125 90L80 30L135 80Z"
                    fill="rgba(27,67,50,0.12)" stroke="rgba(27,67,50,0.4)" strokeWidth="1"/>
                  <circle cx="150" cy="150" r="12" fill="var(--color-forest)"/>
                  <circle cx="150" cy="150" r="6"  fill="var(--color-amber)"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== REVIEWS ====== */}
      <section className="about-reviews section-pad">
        <div className="container">
          <div className="section-header reveal">
            <span className="eyebrow">Community Voices</span>
            <h2>What Our Explorers Say</h2>
            <p>Real experiences from the trails, passes, and summits.</p>
          </div>

          <div className="reviews-switch-card reveal">
            <div className="reviews-switch-tabs" role="tablist" aria-label="Review panel switch">
              {!isAdmin && (
                <button type="button" role="tab"
                  aria-selected={activeReviewPanel === "share"}
                  className={`reviews-switch-tab${activeReviewPanel === "share" ? " active" : ""}`}
                  onClick={() => setActiveReviewPanel("share")}
                >
                  Share Your Experience
                </button>
              )}
              <button type="button" role="tab"
                aria-selected={activeReviewPanel === "reviews"}
                className={`reviews-switch-tab${activeReviewPanel === "reviews" ? " active" : ""}`}
                onClick={() => setActiveReviewPanel("reviews")}
              >
                {tab2Label}
              </button>
            </div>

            <div className="reviews-switch-content">
              {activeReviewPanel === "share"
                ? renderSharePanel()
                : renderReviewsPanel()}
            </div>
          </div>
        </div>
      </section>

      {/* ====== WARRANTY ====== */}
      <section className="about-warranty section-pad">
        <div className="container">
          <div className="section-header reveal" style={{ color: "#fff" }}>
            <span className="eyebrow" style={{ color: "var(--color-amber)" }}>Our Promise</span>
            <h2 style={{ color: "#fff" }}>Warranty Policy</h2>
            <p style={{ color: "rgba(255,255,255,0.75)" }}>
              We stand behind every product we make. Here's exactly what's covered.
            </p>
          </div>
          <div className="warranty-grid reveal">
            <div className="warranty-card">
              <div className="warranty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>2-Year Coverage</h3>
              <p>We cover all SHIKHAR products for <strong>2 years</strong> from the date of purchase — no ifs, no buts.</p>
            </div>
            <div className="warranty-card">
              <div className="warranty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h3>What's Covered</h3>
              <p>Manufacturing defects, faulty stitching, broken zips, defective hardware, delamination, and waterproofing failure under normal use.</p>
            </div>
            <div className="warranty-card">
              <div className="warranty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3>What's Not Covered</h3>
              <p>Normal wear and tear, accidental damage, misuse, improper washing, modifications, or loss.</p>
            </div>
            <div className="warranty-card">
              <div className="warranty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3>How to Claim</h3>
              <p>Email us at <strong>hello@shikharoutdoor.com</strong> with your order number and a photo. We'll respond within 48 hours.</p>
            </div>
          </div>
          <p className="warranty-note reveal">
            Warranty is valid with proof of purchase from SHIKHAR or an authorised retailer.
            In cases of a valid claim, we'll repair, replace, or refund — your choice.
          </p>
        </div>
      </section>
    </main>
  );
}