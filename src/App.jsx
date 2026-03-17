// src\App.jsx
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
import { GoogleOAuthProvider } from "@react-oauth/google";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";
import { useUser } from "./context/UserContext";

const TOKEN_KEY = "shikhar_token";
const USER_KEY = "shikhar_user";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const isAuthenticated = () => !!getToken();
export const setAuth = (token, user = undefined) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  if (token && user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Notify other parts of the app that authentication state changed
  window.dispatchEvent(new Event("auth-changed"));
};
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAdmin } = useUser();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
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
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
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
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!loaded && !isLoginPage && !isAdminPage && (
        <LoadingScreen onDone={() => setLoaded(true)} />
      )}
      {!isLoginPage && !isAdminPage && <ScrollProgress />}
      <ScrollToTop />
      {!isLoginPage && !isAdminPage && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
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
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
      {!isLoginPage && !isAdminPage && <Footer />}
      {!isLoginPage && !isAdminPage && <BackToTop />}
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId="387390235264-pgcq968tkl1snam558av935ksi932k1v.apps.googleusercontent.com">
      <UserProvider>
        <CartProvider>
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}
