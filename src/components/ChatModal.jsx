import { useState, useEffect, useRef } from "react";
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

const SEED_MESSAGES = [
  {
    id: 1,
    from: "admin",
    text: "Hey there! 👋 Welcome to SHIKHAR. I'm your gear specialist — ask me anything about our collection, sizing, or trip recommendations!",
    time: "just now",
  },
];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ───── Contact Us form ───── */
function ContactTab({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", product: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name.";
    if (!form.email.trim()) e.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address.";
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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const subject = encodeURIComponent(`[SHIKHAR Inquiry] ${form.product} — ${form.name}`);
    const body = encodeURIComponent(
      `Hi SHIKHAR Team,\n\nName: ${form.name}\nEmail: ${form.email}\nInterested In: ${form.product}\n\nMessage:\n${form.message}\n\nThanks,\n${form.name}`
    );
    window.location.href = `mailto:${STORE_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="chat-modal__success">
        <div className="chat-modal__success-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3>Message Ready!</h3>
        <p>Your email client opened with everything pre-filled. Hit send and our gear specialists will reply within 24 hours.</p>
        <button className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    );
  }

  return (
    <form className="chat-modal__form" onSubmit={handleSubmit} noValidate>
      <p className="chat-modal__sub">
        Tell us what you're looking for — we'll help you find the perfect gear for your next summit.
      </p>
      <div className="chat-modal__row">
        <div className={`chat-field ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="chat-name">Full Name</label>
          <input id="chat-name" name="name" type="text" placeholder="Adarsh Sharma" value={form.name} onChange={handleChange} autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>
        <div className={`chat-field ${errors.email ? "has-error" : ""}`}>
          <label htmlFor="chat-email">Email Address</label>
          <input id="chat-email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>
      </div>
      <div className={`chat-field ${errors.product ? "has-error" : ""}`}>
        <label htmlFor="chat-product">I'm Interested In</label>
        <div className="chat-select-wrap">
          <select id="chat-product" name="product" value={form.product} onChange={handleChange}>
            <option value="">— Choose a product or category —</option>
            {productOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <svg className="select-chevron" width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {errors.product && <span className="field-error">{errors.product}</span>}
      </div>
      <div className={`chat-field ${errors.message ? "has-error" : ""}`}>
        <label htmlFor="chat-message">Your Message</label>
        <textarea id="chat-message" name="message" rows={4} placeholder="E.g. I'm planning a high-altitude trek and need advice on layering and the right gear..." value={form.message} onChange={handleChange} />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </div>
      <div className="chat-modal__footer">
        <span className="chat-modal__reply-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          We reply within 24 hours
        </span>
        <button type="submit" className="btn btn-primary chat-modal__send">
          Send Message
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </form>
  );
}

/* ───── Live Chat tab ───── */
const AUTO_REPLIES = [
  "Great question! Let me check that for you 🏔️",
  "Sure! We carry a wide range of options for that. Could you share more about your trip?",
  "Absolutely — our gear specialists recommend layering for high altitude. Want specific product suggestions?",
  "Thanks for reaching out! We'll get back to you shortly via email if needed.",
  "That's one of our best sellers! Limited stock available right now.",
];

function LiveChatTab() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const replyIdx = useRef(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: Date.now(), from: "user", text, time: getTime() };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);

    // Simulated auto-reply
    setTimeout(() => {
      const reply = AUTO_REPLIES[replyIdx.current % AUTO_REPLIES.length];
      replyIdx.current += 1;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "admin", text: reply, time: getTime() },
      ]);
    }, 900 + Math.random() * 600);
  }

  return (
    <div className="live-chat">
      <div className="live-chat__admin-bar">
        <div className="live-chat__avatar">S</div>
        <div className="live-chat__admin-info">
          <span className="live-chat__admin-name">SHIKHAR Gear Specialist</span>
          <span className="live-chat__admin-status">
            <span className="live-chat__online-dot" />
            Online
          </span>
        </div>
      </div>

      <div className="live-chat__messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`live-chat__bubble-row ${msg.from === "user" ? "user" : "admin"}`}>
            {msg.from === "admin" && <div className="live-chat__bubble-avatar">S</div>}
            <div className="live-chat__bubble">
              <span className="live-chat__bubble-text">{msg.text}</span>
              <span className="live-chat__bubble-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="live-chat__input-row" onSubmit={sendMessage}>
        <input
          className="live-chat__input"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="live-chat__send-btn" aria-label="Send" disabled={!input.trim()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
          </svg>
        </button>
      </form>
    </div>
  );
}

/* ───── Main modal ───── */
export default function ChatModal({ isOpen, onClose }) {
  const [tab, setTab] = useState("contact");

  useEffect(() => {
    document.body.classList.toggle("no-scroll", isOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);

  // Reset to contact tab when re-opened
  useEffect(() => {
    if (isOpen) setTab("contact");
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Chat with us">

        {/* Header */}
        <div className="chat-modal__header">
          <div className="chat-modal__header-text">
            <span className="chat-modal__eyebrow">Gear Specialists</span>
            <h2 className="chat-modal__title">Chat With Us</h2>
          </div>
          <button className="chat-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab toggle */}
        <div className="chat-modal__tabs">
          <button
            className={`chat-modal__tab${tab === "contact" ? " active" : ""}`}
            onClick={() => setTab("contact")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Contact Us
          </button>
          <button
            className={`chat-modal__tab${tab === "live" ? " active" : ""}`}
            onClick={() => setTab("live")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Live Chat
            <span className="chat-tab-dot" />
          </button>
        </div>

        {/* Tab content */}
        <div className="chat-modal__body">
          {tab === "contact" ? <ContactTab onClose={onClose} /> : <LiveChatTab />}
        </div>

      </div>
    </div>
  );
}
