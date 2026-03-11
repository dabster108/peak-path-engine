import { useState, useEffect } from "react";
import "./ChatModal.css";

const STORE_EMAIL = "hello@shikharoutdoor.com";

const productOptions = [
  "Hiking Pants",
  "Down Jackets",
  "Goretex / Hardshell",
  "Buffs & Neck Gaiters",
  "Socks",
  "T-Shirts",
  "Goggles",
  "Trekking Poles",
  "Backpacks",
  "Equipment & Camping",
  "Footwear",
  "Other / General Query",
];

export default function ChatModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    product: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  // Reset form when modal re-opens
  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", email: "", product: "", message: "" });
      setErrors({});
      setSubmitted(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) {
      e.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.product) e.product = "Please select a product or category.";
    if (!form.message.trim()) e.message = "Please describe what you need.";
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const subject = encodeURIComponent(
      `[SHIKHAR Inquiry] ${form.product} — ${form.name}`,
    );
    const body = encodeURIComponent(
      `Hi SHIKHAR Team,\n\nName: ${form.name}\nEmail: ${form.email}\nInterested In: ${form.product}\n\nMessage:\n${form.message}\n\nThanks,\n${form.name}`,
    );
    window.location.href = `mailto:${STORE_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div
        className="chat-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Chat with us"
      >
        {/* Header */}
        <div className="chat-modal__header">
          <div className="chat-modal__header-text">
            <span className="chat-modal__eyebrow">Gear Specialists</span>
            <h2 className="chat-modal__title">Chat With Us</h2>
          </div>
          <button
            className="chat-modal__close"
            onClick={onClose}
            aria-label="Close"
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
          </button>
        </div>

        {submitted ? (
          <div className="chat-modal__success">
            <div className="chat-modal__success-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>Message Ready!</h3>
            <p>
              Your email client has opened with everything pre-filled. Hit send
              and our gear specialists will get back to you within 24 hours.
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="chat-modal__form" onSubmit={handleSubmit} noValidate>
            <p className="chat-modal__sub">
              Tell us what you're looking for — we'll help you find the perfect
              gear for your next summit.
            </p>

            <div className="chat-modal__row">
              {/* Name */}
              <div className={`chat-field ${errors.name ? "has-error" : ""}`}>
                <label htmlFor="chat-name">Full Name</label>
                <input
                  id="chat-name"
                  name="name"
                  type="text"
                  placeholder="Adarsh Sharma"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className={`chat-field ${errors.email ? "has-error" : ""}`}>
                <label htmlFor="chat-email">Email Address</label>
                <input
                  id="chat-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>

            {/* Product Interest */}
            <div className={`chat-field ${errors.product ? "has-error" : ""}`}>
              <label htmlFor="chat-product">I'm Interested In</label>
              <div className="chat-select-wrap">
                <select
                  id="chat-product"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                >
                  <option value="">— Choose a product or category —</option>
                  {productOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <svg
                  className="select-chevron"
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                >
                  <path
                    d="M1 1l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {errors.product && (
                <span className="field-error">{errors.product}</span>
              )}
            </div>

            {/* Message */}
            <div className={`chat-field ${errors.message ? "has-error" : ""}`}>
              <label htmlFor="chat-message">Your Message</label>
              <textarea
                id="chat-message"
                name="message"
                rows={4}
                placeholder="E.g. I'm planning a high-altitude trek to Everest Base Camp and need advice on layering, the right down jacket, and trekking poles..."
                value={form.message}
                onChange={handleChange}
              />
              {errors.message && (
                <span className="field-error">{errors.message}</span>
              )}
            </div>

            <div className="chat-modal__footer">
              <span className="chat-modal__reply-note">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                We reply within 24 hours
              </span>
              <button
                type="submit"
                className="btn btn-primary chat-modal__send"
              >
                Send Message
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m22 2-7 20-4-9-9-4 20-7z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
