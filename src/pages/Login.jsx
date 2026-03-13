// src\pages\Login.jsx
import { useState, useRef } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { isAuthenticated, setAuth } from "../App";
import api from "../utils/api";
import { useGoogleLogin } from "@react-oauth/google";
import "./Login.css";

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  duration: Math.random() * 12 + 10,
  delay: Math.random() * 10,
  color: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#3b82f6" : "#fff",
}));

export default function Login() {
  // Already logged in → skip login page
  if (isAuthenticated()) return <Navigate to="/" replace />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const btnRef = useRef(null);

  // Ripple effect on login button
  const handleRipple = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "login-btn-ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("login/", {
        username: email, 
        password: password,
      });

      const { access, user } = response.data;
      const isAdmin = user?.role === "admin";

      localStorage.setItem("shikhar_token", access);
      setAuth(access);

      setSuccess(true);

      setTimeout(() => navigate(isAdmin ? "/admin" : "/"), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      const token =
        tokenResponse?.access_token || tokenResponse?.id_token || tokenResponse?.credential;

      if (!token) {
        setError("Google did not return a token");
        return;
      }

      try {
        const res = await api.post("google-login/", {
          token,
        });

        const { access, user } = res.data;
        const isAdmin = user?.role === "admin";

        localStorage.setItem("shikhar_token", access);
        setAuth(access);

        setSuccess(true);

        setTimeout(() => {
          navigate(isAdmin ? "/admin" : "/");
        }, 1200);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Google login failed");
      }
    },

    onError: (errorResponse) => {
      console.error(errorResponse);
      setError("Google authentication failed");
    },
  });
  return (
    <div className="login-page">
      {/* Background */}
      <div className="login-bg" />
      <div className="login-bg-mountains" />

      {/* Floating Particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="login-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="login-card-wrapper">
        {/* Spinning glow border */}
        <div className="login-card-glow" />

        <div className="login-card">
          {/* Success overlay */}
          {success && (
            <div className="login-success-overlay">
              <div className="login-success-check">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0a0f1a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="login-success-text">Welcome to SHIKHAR</div>
              <div className="login-success-sub">Redirecting you…</div>
            </div>
          )}

          {/* Logo */}
          <Link to="/" className="login-logo">
            <span className="login-logo-mark">
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
                <polygon
                  points="14,2 26,24 2,24"
                  fill="currentColor"
                  opacity="0.9"
                />
                <polygon points="14,8 21,24 7,24" fill="white" opacity="0.3" />
              </svg>
            </span>
            <span className="login-logo-text">SHIKHAR</span>
          </Link>

          {/* Heading */}
          <div className="login-heading">
            <h1>Welcome Back</h1>
            <p>Sign in to your adventure account</p>
          </div>

          {/* Google sign-in */}
          <button
            className="login-google-btn"
            onClick={() => googleLogin()}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="login-divider">
            <span />
            <span className="login-divider-text">or sign in with email</span>
            <span />
          </div>

          {/* Error */}
          {error && (
            <div className="login-error">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-email">
                Email
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                />
                <span className="login-input-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label className="login-label" htmlFor="login-password">
                Password
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <span className="login-input-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="login-forgot">
              <a href="#">Forgot password?</a>
            </div>

            {/* Submit */}
            <button
              ref={btnRef}
              type="submit"
              className="login-btn"
              disabled={loading}
              onClick={handleRipple}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className="login-footer-text">
            Don't have an account? <a href="#">Create one — it's free</a>
          </p>
        </div>
      </div>
    </div>
  );
}
