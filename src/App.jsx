import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// --- Simple auth helpers (localStorage-backed) ---
const AUTH_KEY = "shikhar_auth";
export const isAuthenticated = () => !!localStorage.getItem(AUTH_KEY);
export const setAuth = (val) =>
  val ? localStorage.setItem(AUTH_KEY, "1") : localStorage.removeItem(AUTH_KEY);

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}
import Home from "./pages/Home";
import Mens from "./pages/Mens";
import Womens from "./pages/Womens";
import Footwear from "./pages/Footwear";
import About from "./pages/About";
import Backpacks from "./pages/Backpacks";
import Equipment from "./pages/Equipment";
import Goretex from "./pages/Goretex";
import Terms from "./pages/Terms";
import Bottles from "./pages/Bottles";
import Login from "./pages/Login";
import "./App.css";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setWidth(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: width + "%" }} />;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      className={"back-to-top" + (visible ? " visible" : "")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

function LoadingScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDone, 700);
    }, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={"loading-screen" + (fadeOut ? " fade-out" : "")}>
      <div className="loading-logo-text">SHIKHAR</div>
      <div className="loading-tagline">Conquer Every Summit</div>
      <div className="loading-bar-wrap">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}

function AppInner() {
  // Skip loading splash when not yet authenticated (user will see login page first)
  const [loaded, setLoaded] = useState(!isAuthenticated());
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      {!loaded && !isLoginPage && (
        <LoadingScreen onDone={() => setLoaded(true)} />
      )}
      {!isLoginPage && <ScrollProgress />}
      <ScrollToTop />
      {!isLoginPage && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mens"
          element={
            <ProtectedRoute>
              <Mens />
            </ProtectedRoute>
          }
        />
        <Route
          path="/womens"
          element={
            <ProtectedRoute>
              <Womens />
            </ProtectedRoute>
          }
        />
        <Route
          path="/footwear"
          element={
            <ProtectedRoute>
              <Footwear />
            </ProtectedRoute>
          }
        />
        <Route
          path="/backpacks"
          element={
            <ProtectedRoute>
              <Backpacks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <Equipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goretex"
          element={
            <ProtectedRoute>
              <Goretex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bottles"
          element={
            <ProtectedRoute>
              <Bottles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/terms"
          element={
            <ProtectedRoute>
              <Terms />
            </ProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <BackToTop />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
