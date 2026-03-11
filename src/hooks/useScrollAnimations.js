import { useEffect } from "react";

export function useScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const elementsToObserve = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-scale, .heading-reveal",
    );
    elementsToObserve.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  });
}
