import "./ProductCard.css";

export default function ProductCard({ product, index = 0 }) {
  const { name, category, price, originalPrice, badge, gradient } = product;

  return (
    <div
      className="product-card reveal"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="product-card__image-wrap">
        {/* Gradient placeholder with mountain SVG */}
        <div
          className="product-card__image"
          style={{
            background:
              gradient ||
              "linear-gradient(135deg, #1B4332 0%, #2d6a4f 50%, #0d2b1e 100%)",
          }}
        >
          <svg
            className="mountain-silhouette"
            viewBox="0 0 300 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 200L60 100L100 140L150 60L200 120L240 80L300 130V200H0Z"
              fill="rgba(255,255,255,0.06)"
            />
            <path
              d="M0 200L80 120L130 160L180 80L230 130L300 90V200H0Z"
              fill="rgba(255,255,255,0.04)"
            />
            <path
              d="M150 60L170 90L165 85L180 100L150 60Z"
              fill="rgba(255,255,255,0.15)"
            />
          </svg>
        </div>
        {badge && <span className="product-card__badge">{badge}</span>}
        <div className="product-card__overlay">
          <button className="btn btn-secondary product-card__cta">
            Quick View
          </button>
        </div>
      </div>
      <div className="product-card__info">
        <p className="product-card__category">{category}</p>
        <h3 className="product-card__name">{name}</h3>
        <div className="product-card__pricing">
          {originalPrice && (
            <span className="product-card__original">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>
          )}
          <span className="product-card__price">
            ₹{price.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
