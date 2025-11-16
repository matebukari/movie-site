import { useEffect, useRef } from "react";

/**
 * Debounced infinite scroll listener
 */
export default function useDebouncedInfiniteScroll(callback, deps = []) {
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (debounceRef.current) return;

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;

        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300
        ) {
          callback();
        }
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, deps);
}
