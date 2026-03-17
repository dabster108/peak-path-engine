import { useEffect, useState } from "react";
import { formatNpr } from "../utils/currency";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

const SIZE_OPTIONS = ["Small", "Medium", "Large", "XL"];

export default function ProductCard({ product, index = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { name, category, price, originalPrice, badge, gradient } = product;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEsc);
    document.body.classList.add("no-scroll");

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen]);

  function incrementQty() {
    setQuantity((prev) => Math.min(10, prev + 1));
  }

  function decrementQty() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function handleAddToCart() {
    addItem({
      id: product.id,
      name,
      category,
      price,
      size: selectedSize,
      quantity,
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsOpen(false);
    }, 700);
  }

  return (
    <>
      <div
        className="product-card reveal"
        style={{ transitionDelay: `${index * 80}ms` }}
        onClick={() => setIsOpen(true)}
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
            <button
              type="button"
              className="btn btn-secondary product-card__cta"
              onClick={(event) => {
                event.stopPropagation();
                setIsOpen(true);
              }}
            >
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
                {formatNpr(originalPrice)}
              </span>
            )}
            <span className="product-card__price">{formatNpr(price)}</span>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="product-quickview" onClick={() => setIsOpen(false)}>
          <div
            className="product-quickview__panel"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} options`}
          >
            <button
              type="button"
              className="product-quickview__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close product options"
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

            <div className="product-quickview__preview">
              <div className="product-quickview__preview-box">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="m3 14 5-5 4 4 4-3 5 4" />
                  <circle cx="9" cy="9" r="1.4" />
                </svg>
                <span>Image preview</span>
              </div>
            </div>

            <div className="product-quickview__details">
              <p className="product-quickview__category">{category}</p>
              <h4>{name}</h4>
              <p className="product-quickview__price">{formatNpr(price)}</p>

              <div className="product-quickview__field">
                <span className="product-quickview__label">Size</span>
                <div className="product-quickview__sizes">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`product-quickview__size${selectedSize === size ? " active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="product-quickview__field">
                <span className="product-quickview__label">Order quantity</span>
                <div className="product-quickview__qty-row">
                  <button
                    type="button"
                    onClick={decrementQty}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value) || 1;
                      setQuantity(Math.min(10, Math.max(1, nextValue)));
                    }}
                  />
                  <button
                    type="button"
                    onClick={incrementQty}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="product-quickview__add-btn"
                onClick={handleAddToCart}
              >
                Add To Cart
              </button>
              {added && (
                <p className="product-quickview__added-message">
                  Added to cart.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
