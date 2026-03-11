import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mens" element={<Mens />} />
        <Route path="/womens" element={<Womens />} />
        <Route path="/footwear" element={<Footwear />} />{" "}
        <Route path="/backpacks" element={<Backpacks />} />
        <Route path="/equipment" element={<Equipment />} />{" "}
        <Route path="/goretex" element={<Goretex />} />{" "}
        <Route path="/bottles" element={<Bottles />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Footer />
      <BackToTop />
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
