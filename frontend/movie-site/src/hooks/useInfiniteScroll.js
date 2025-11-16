import { useEffect } from "react";

export default function useInfiniteScroll(callback, deps = []) {
  let scrollTimeout;

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const reachedBottom =
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300;

        if (reachedBottom) callback();
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, deps);
}
