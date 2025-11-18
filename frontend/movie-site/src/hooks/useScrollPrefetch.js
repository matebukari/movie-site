import { useEffect } from "react";

/**
 * Prefetch next page early when user scrolls past a threshold.
 *
 * @param {Function} callback - The fetch function to run.
 * @param {Object} deps - Dependencies for scroll conditions.
 * @param {number} threshold - % of page scroll before triggering (0.0–1.0).
 */
export default function useScrollPrefetch(callback, deps = {}, threshold = 0.3) {
  const { loading, hasMore, length, max } = deps;

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const current = window.scrollY;

      // only fire when scrolling DOWN
      if (current <= lastScroll) {
        lastScroll = current;
        return;
      }

      lastScroll = current;

      const ratio =
        (window.scrollY + window.innerHeight) /
        document.body.scrollHeight;

      if (
        ratio > threshold &&
        !loading &&
        hasMore &&
        length < max
      ) {
        callback(); // runLocked wrapper is included by the page
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);

  }, [loading, hasMore, length, max, threshold, callback]);
}
