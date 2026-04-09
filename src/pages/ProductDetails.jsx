import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { formatNpr } from "../utils/currency";
import { cacheProductForDetails, getCachedProductByHandle } from "../utils/productRoute";
import api from "../utils/api";
import "./ProductDetails.css";

const SIZE_OPTIONS = ["Small", "Medium", "Large", "XL"];

function ReviewStars({ rating }) {
  return (
    <div className="product-review-stars" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "filled" : "empty"}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetails() {
  const { handle }   = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();
  const { addItem }  = useCart();
  const { user, displayName, isAdmin } = useUser();

  const [size, setSize]         = useState("Medium");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded]       = useState(false);

  const [reviews, setReviews]               = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError]     = useState("");
  const [hasReviewed, setHasReviewed]       = useState(false);

  const [reviewForm, setReviewForm]     = useState({ author: displayName || "", rating: 5, text: "" });
  const [reviewError, setReviewError]   = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  const product = useMemo(() => {
    if (location.state?.product) return location.state.product;
    return getCachedProductByHandle(handle);
  }, [handle, location.state]);

  useEffect(() => {
    if (product) cacheProductForDetails(product);
  }, [product]);

  // Fetch reviews from backend
  useEffect(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    setReviewsError("");
    api.get(`products/${product.id}/reviews/`)
      .then((res) => {
        setReviews(res.data);
        if (user) {
          setHasReviewed(res.data.some((r) => r.author === displayName));
        }
      })
      .catch(() => setReviewsError("Could not load reviews."))
      .finally(() => setReviewsLoading(false));
  }, [product?.id, user, displayName]);

  // Sync author name when user loads
  useEffect(() => {
    setReviewForm((prev) => ({ ...prev, author: displayName || "" }));
  }, [displayName]);

  if (!product) {
    return (
      <main className="product-details-page">
        <div className="container">
          <div className="product-details-missing">
            <h1>Product not available</h1>
            <p>We could not load this product. Please open it again from a collection page.</p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </main>
    );
  }

  const { id, name, category, price, originalPrice, badge, gradient, description, images } = product;

  const primaryImage = useMemo(() => {
    if (!images?.length) return null;
    return (images.find((img) => img.is_primary) || images[0])?.image || null;
  }, [images]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  function incrementQty() { setQuantity((p) => Math.min(10, p + 1)); }
  function decrementQty() { setQuantity((p) => Math.max(1, p - 1)); }

  function handleAddToCart() {
    addItem({ id, name, category, price, size, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setReviewError("");

    if (reviewForm.text.trim().length < 12) {
      setReviewError("Please write at least 12 characters.");
      return;
    }

    setReviewSaving(true);
    try {
      const res = await api.post(`products/${id}/reviews/`, {
        author: reviewForm.author.trim() || "Anonymous",
        rating: reviewForm.rating,
        text:   reviewForm.text.trim(),
      });
      setReviews((prev) => [res.data, ...prev]);
      setHasReviewed(true);
      setReviewForm({ author: displayName || "", rating: 5, text: "" });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.error) setReviewError(data.error);
      else setReviewError("Failed to submit review. Please try again.");
    } finally {
      setReviewSaving(false);
    }
  }

  // ── Decide what to render in the review form panel ──────
  function renderReviewPanel() {
    // Not logged in
    if (!user) {
      return (
        <div className="product-review-form product-review-form--gate">
          <h3>Write a Review</h3>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
            You need to be signed in to leave a review.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Sign In to Review
          </button>
        </div>
      );
    }

    // Admin — can read but not write
    if (isAdmin) {
      return (
        <div className="product-review-form product-review-form--gate">
          <h3>Reviews</h3>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Admin accounts cannot submit product reviews.
          </p>
        </div>
      );
    }

    // Already reviewed
    if (hasReviewed) {
      return (
        <div className="product-review-form">
          <h3>Your Review</h3>
          <p style={{ color: "var(--color-text-secondary)" }}>
            You have already reviewed this product. Thank you!
          </p>
        </div>
      );
    }

    // Regular user — show form
    return (
      <form className="product-review-form" onSubmit={handleReviewSubmit}>
        <h3>Write a Review</h3>

        <label>
          Your Name
          <input
            type="text"
            value={reviewForm.author}
            onChange={(e) => setReviewForm((p) => ({ ...p, author: e.target.value }))}
            placeholder="e.g. Rohan B."
          />
        </label>

        <label>
          Rating
          <select
            value={reviewForm.rating}
            onChange={(e) => setReviewForm((p) => ({ ...p, rating: Number(e.target.value) }))}
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>{v} Star{v > 1 ? "s" : ""}</option>
            ))}
          </select>
        </label>

        <label>
          Review
          <textarea
            rows="4"
            value={reviewForm.text}
            onChange={(e) => setReviewForm((p) => ({ ...p, text: e.target.value }))}
            placeholder="Share your experience with this product"
          />
        </label>

        {reviewError && <p className="product-review-error">{reviewError}</p>}

        <button type="submit" className="btn btn-primary" disabled={reviewSaving}>
          {reviewSaving ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    );
  }

  return (
    <main className="product-details-page">
      <section className="product-details-hero">
        <div className="container">
          <div className="product-details-breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{category}</span>
            <span>/</span>
            <strong>{name}</strong>
          </div>

          <div className="product-details-layout">
            <div className="product-details-media">
              <div
                className="product-details-image"
                style={{
                  background: primaryImage
                    ? "transparent"
                    : gradient || "linear-gradient(135deg, #1B4332 0%, #2d6a4f 50%, #0d2b1e 100%)",
                }}
              >
                {primaryImage ? (
                  <img src={primaryImage} alt={name} className="product-details-img"/>
                ) : (
                  <svg className="product-details-mountain" viewBox="0 0 300 200" fill="none">
                    <path d="M0 200L60 100L100 140L150 60L200 120L240 80L300 130V200H0Z" fill="rgba(255,255,255,0.08)"/>
                    <path d="M0 200L80 120L130 160L180 80L230 130L300 90V200H0Z" fill="rgba(255,255,255,0.05)"/>
                  </svg>
                )}
                {badge && <span className="product-details-badge">{badge}</span>}
              </div>

              {images?.length > 1 && (
                <div className="product-details-thumbs">
                  {images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image}
                      alt={name}
                      className={`product-details-thumb${img.is_primary ? " active" : ""}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="product-details-info">
              <p className="product-details-category">{category}</p>
              <h1>{name}</h1>

              {averageRating && (
                <div className="product-details-rating-row">
                  <ReviewStars rating={Math.round(Number(averageRating))}/>
                  <span>{averageRating} ({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                </div>
              )}

              <div className="product-details-price-row">
                {originalPrice && (
                  <span className="product-details-original">{formatNpr(originalPrice)}</span>
                )}
                <span className="product-details-price">{formatNpr(price)}</span>
              </div>

              {description ? (
                <p className="product-details-description">{description}</p>
              ) : (
                <p className="product-details-description" style={{ opacity: 0.5 }}>
                  No description available.
                </p>
              )}

              <div className="product-details-option-block">
                <span className="product-details-label">Select size</span>
                <div className="product-details-sizes">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option} type="button"
                      className={`product-details-size${size === option ? " active" : ""}`}
                      onClick={() => setSize(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="product-details-option-block">
                <span className="product-details-label">Quantity</span>
                <div className="product-details-qty-row">
                  <button type="button" onClick={decrementQty}>-</button>
                  <input
                    type="number" min="1" max="10" value={quantity}
                    onChange={(e) => setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
                  />
                  <button type="button" onClick={incrementQty}>+</button>
                </div>
              </div>

              <div className="product-details-actions">
                <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
                  Add To Cart
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Continue Shopping
                </button>
              </div>

              {added && <p className="product-details-added">Product added to cart.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews Section ───────────────────────────────── */}
      <section className="product-details-reviews">
        <div className="container">
          <div className="product-details-reviews-head">
            <h2>Product Reviews</h2>
            {averageRating
              ? <p>{averageRating} average rating from {reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
              : <p>No reviews yet — be the first.</p>
            }
          </div>

          <div className="product-details-reviews-layout">
            {/* Review list — all users and admins can see all reviews */}
            <div className="product-details-review-list">
              {reviewsLoading && <p className="product-review-loading">Loading reviews…</p>}
              {reviewsError   && <p className="product-review-error">{reviewsError}</p>}
              {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                <p className="product-review-empty">No reviews yet.</p>
              )}
              {reviews.map((review, index) => (
                <article key={`${review.id ?? index}`} className="product-review-card">
                  <div className="product-review-card-top">
                    <strong>{review.author}</strong>
                    <span>{review.date}</span>
                  </div>
                  <ReviewStars rating={Number(review.rating || 0)}/>
                  <p>{review.text}</p>
                </article>
              ))}
            </div>

            {/* Right panel — controlled by role */}
            {renderReviewPanel()}
          </div>
        </div>
      </section>
    </main>
  );
}

