import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatNpr } from "../utils/currency";
import {
  cacheProductForDetails,
  getCachedProductByHandle,
} from "../utils/productRoute";
import "./ProductDetails.css";

const SIZE_OPTIONS = ["Small", "Medium", "Large", "XL"];
const PRODUCT_REVIEW_CACHE_KEY = "shikhar_product_reviews_v1";

const CATEGORY_SEED_REVIEWS = {
  backpacks: [
    {
      author: "Sanjay R.",
      rating: 5,
      text: "Great load distribution and very comfortable on long climbs.",
      date: "Mar 2026",
    },
    {
      author: "Meera P.",
      rating: 4,
      text: "Solid build quality and good compartment layout for trekking.",
      date: "Feb 2026",
    },
  ],
  footwear: [
    {
      author: "Aditi K.",
      rating: 5,
      text: "Excellent grip on wet rock and stable support on steep trails.",
      date: "Jan 2026",
    },
    {
      author: "Karan T.",
      rating: 4,
      text: "Comfortable fit and durable sole after repeated mountain use.",
      date: "Dec 2025",
    },
  ],
};

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function readReviewCache() {
  try {
    const raw = localStorage.getItem(PRODUCT_REVIEW_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeReviewCache(cache) {
  localStorage.setItem(PRODUCT_REVIEW_CACHE_KEY, JSON.stringify(cache));
}

function getSeedReviews(product) {
  const categoryKey = normalizeKey(product?.category);
  if (CATEGORY_SEED_REVIEWS[categoryKey]) {
    return CATEGORY_SEED_REVIEWS[categoryKey];
  }

  return [
    {
      author: "Trail User",
      rating: 5,
      text: "Reliable performance and comfort in changing weather conditions.",
      date: "Mar 2026",
    },
    {
      author: "Mountain Explorer",
      rating: 4,
      text: "Well built and practical for regular outdoor adventures.",
      date: "Feb 2026",
    },
  ];
}

function ReviewStars({ rating }) {
  return (
    <div
      className="product-review-stars"
      aria-label={`Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? "filled" : "empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

function buildDescription(product) {
  const category = product?.category || "outdoor gear";
  const name = product?.name || "This product";
  return `${name} is designed for serious mountain use with a focus on durability, comfort, and reliable performance in changing trail conditions. Perfect for ${category.toLowerCase()} adventures.`;
}

export default function ProductDetails() {
  const { handle } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [size, setSize] = useState("Medium");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    author: "",
    rating: 5,
    text: "",
  });
  const [reviewError, setReviewError] = useState("");

  const product = useMemo(() => {
    if (location.state?.product) return location.state.product;
    return getCachedProductByHandle(handle);
  }, [handle, location.state]);

  useEffect(() => {
    if (product) {
      cacheProductForDetails(product);
    }
  }, [product]);

  useEffect(() => {
    if (!product || !handle) return;

    const cache = readReviewCache();
    const cachedReviews = cache[handle];
    if (Array.isArray(cachedReviews) && cachedReviews.length) {
      setProductReviews(cachedReviews);
      return;
    }

    const seeded = getSeedReviews(product);
    setProductReviews(seeded);
    cache[handle] = seeded;
    writeReviewCache(cache);
  }, [handle, product]);

  if (!product) {
    return (
      <main className="product-details-page">
        <div className="container">
          <div className="product-details-missing">
            <h1>Product not available</h1>
            <p>
              We could not load this product details page. Please open the
              product again from a collection page.
            </p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { id, name, category, price, originalPrice, badge, gradient } = product;

  function incrementQty() {
    setQuantity((prev) => Math.min(10, prev + 1));
  }

  function decrementQty() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function handleAddToCart() {
    addItem({
      id,
      name,
      category,
      price,
      size,
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }

  function handleReviewSubmit(event) {
    event.preventDefault();
    const author = reviewForm.author.trim() || "Anonymous";
    const text = reviewForm.text.trim();

    if (text.length < 12) {
      setReviewError("Please write at least 12 characters for your review.");
      return;
    }

    const nextReview = {
      author,
      rating: reviewForm.rating,
      text,
      date: "Mar 2026",
    };

    const nextReviews = [nextReview, ...productReviews];
    setProductReviews(nextReviews);
    setReviewForm({ author: "", rating: 5, text: "" });
    setReviewError("");

    if (handle) {
      const cache = readReviewCache();
      cache[handle] = nextReviews;
      writeReviewCache(cache);
    }
  }

  const averageRating =
    productReviews.length > 0
      ? (
          productReviews.reduce(
            (sum, item) => sum + Number(item.rating || 0),
            0,
          ) / productReviews.length
        ).toFixed(1)
      : "0.0";

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
                  background:
                    gradient ||
                    "linear-gradient(135deg, #1B4332 0%, #2d6a4f 50%, #0d2b1e 100%)",
                }}
              >
                <svg
                  className="product-details-mountain"
                  viewBox="0 0 300 200"
                  fill="none"
                >
                  <path
                    d="M0 200L60 100L100 140L150 60L200 120L240 80L300 130V200H0Z"
                    fill="rgba(255,255,255,0.08)"
                  />
                  <path
                    d="M0 200L80 120L130 160L180 80L230 130L300 90V200H0Z"
                    fill="rgba(255,255,255,0.05)"
                  />
                </svg>
                {badge && (
                  <span className="product-details-badge">{badge}</span>
                )}
              </div>
            </div>

            <div className="product-details-info">
              <p className="product-details-category">{category}</p>
              <h1>{name}</h1>

              <div className="product-details-price-row">
                {originalPrice && (
                  <span className="product-details-original">
                    {formatNpr(originalPrice)}
                  </span>
                )}
                <span className="product-details-price">
                  {formatNpr(price)}
                </span>
              </div>

              <p className="product-details-description">
                {buildDescription(product)}
              </p>

              <div className="product-details-option-block">
                <span className="product-details-label">Select size</span>
                <div className="product-details-sizes">
                  {SIZE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
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
                  <button type="button" onClick={decrementQty}>
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(event) => {
                      const next = Number(event.target.value) || 1;
                      setQuantity(Math.min(10, Math.max(1, next)));
                    }}
                  />
                  <button type="button" onClick={incrementQty}>
                    +
                  </button>
                </div>
              </div>

              <div className="product-details-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddToCart}
                >
                  Add To Cart
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate(-1)}
                >
                  Continue Shopping
                </button>
              </div>

              {added && (
                <p className="product-details-added">Product added to cart.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="product-details-reviews">
        <div className="container">
          <div className="product-details-reviews-head">
            <h2>Product Reviews</h2>
            <p>
              {averageRating} average rating from {productReviews.length}{" "}
              reviews
            </p>
          </div>

          <div className="product-details-reviews-layout">
            <div className="product-details-review-list">
              {productReviews.map((review, index) => (
                <article
                  key={`${review.author}-${index}`}
                  className="product-review-card"
                >
                  <div className="product-review-card-top">
                    <strong>{review.author}</strong>
                    <span>{review.date}</span>
                  </div>
                  <ReviewStars rating={Number(review.rating || 0)} />
                  <p>{review.text}</p>
                </article>
              ))}
            </div>

            <form className="product-review-form" onSubmit={handleReviewSubmit}>
              <h3>Upload Product Review</h3>

              <label>
                Your Name
                <input
                  type="text"
                  value={reviewForm.author}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      author: event.target.value,
                    }))
                  }
                  placeholder="e.g. Rohan B."
                />
              </label>

              <label>
                Rating
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      rating: Number(event.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} Star{value > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Review
                <textarea
                  rows="4"
                  value={reviewForm.text}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      text: event.target.value,
                    }))
                  }
                  placeholder="Share your experience with this product"
                />
              </label>

              {reviewError && (
                <p className="product-review-error">{reviewError}</p>
              )}

              <button type="submit" className="btn btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
