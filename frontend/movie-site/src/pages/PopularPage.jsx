import { useState, useEffect } from "react";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";
import Navbar from "../components/Navbar";
import { useCountry } from "../context/CountryContext";

function PopularPage() {
  const { country, countryDetected } = useCountry();
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;
  const MAX_SHOWS = 102;
  const PAGE_LIMIT = 20;

  /** ⚡ Load from cache if available and valid */
  useEffect(() => {
    const cacheKey = `popular-${country}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (
          parsed &&
          Array.isArray(parsed.results) &&
          parsed.results.length > 0 &&
          parsed.country === country
        ) {
          console.log(`⚡ Loaded ${parsed.results.length} popular shows from cache for ${country}`);
          setShows(parsed.results);
          setPage(parsed.nextPage || 6);
          setHasMore(parsed.hasMore ?? true);
          return; // ✅ Skip fresh fetch
        }
      } catch {
        console.warn("🧹 Invalid cache, clearing...");
        sessionStorage.removeItem(cacheKey);
      }
    }
  }, [country]);

  /** 🎬 Fetch more popular titles */
  const fetchPopular = async (reset = false, customPage = null) => {
    if (loading || !countryDetected) return;
    setLoading(true);
    setError("");

    try {
      const currentPage = customPage || (reset ? 1 : page);
      const endpoint = `${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch popular shows");

      console.log(`🎬 Received ${data.results?.length || 0} shows for ${country} (page ${currentPage})`);

      setShows((prev) => {
        const newShows = reset ? data.results : [...prev, ...data.results];
        const unique = Array.from(new Map(newShows.map((s) => [s.id, s])).values());
        const limited = unique.slice(0, MAX_SHOWS);
        const hasMoreResults = limited.length < MAX_SHOWS && data.results.length > 0;

        sessionStorage.setItem(
          `popular-${country}`,
          JSON.stringify({
            country,
            results: limited,
            nextPage: currentPage + 1,
            hasMore: hasMoreResults,
          })
        );

        setHasMore(hasMoreResults);
        return limited;
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error fetching popular shows:", err);
      setError("Error fetching popular shows");
    } finally {
      setLoading(false);
    }
  };

  /** 🚀 Parallel preload for first 5 pages */
  useEffect(() => {
    console.log("🚀 Popular preload triggered:", { countryDetected, country });
    if (!country) return; // ✅ Start even before detection finishes

    const cacheKey = `popular-${country}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.results?.length > 0) return; // ✅ Skip reload if cache valid
    }

    const loadInitial = async () => {
      console.log(`📡 Fetching popular shows for ${country}`);
      setLoading(true);
      setError("");
      setShows([]);
      setPage(1);
      setHasMore(true);

      try {
        const pages = [1, 2, 3, 4, 5];
        const fetches = pages.map((p) =>
          fetch(`${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${p}`).then((r) => r.json())
        );

        const results = await Promise.all(fetches);
        const allShows = results.flatMap((r) => r.results || []);
        const unique = Array.from(new Map(allShows.map((s) => [s.id, s])).values());
        const limited = unique.slice(0, MAX_SHOWS);

        console.log(`✅ Preloaded ${limited.length} shows for ${country}`);

        setShows(limited);
        setPage(6);
        setHasMore(limited.length < MAX_SHOWS);

        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            country,
            results: limited,
            nextPage: 6,
            hasMore: limited.length < MAX_SHOWS,
          })
        );
      } catch (err) {
        console.error("❌ Failed to preload popular shows:", err);
        setError("Failed to load popular shows");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [countryDetected, country]);

  /** 🧭 Infinite scroll */
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        fetchPopular();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, country]);

  if (!countryDetected && shows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Detecting your location...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="p-8">
        <h1 className="text-3xl font-semibold mb-6 text-center text-blue-400">
          🌟 Popular in {country?.toUpperCase() || "US"}
        </h1>

        {error && <p className="text-center text-red-400">{error}</p>}

        {/* Show Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>

        {/* Skeleton Loader */}
        {loading && shows.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && shows.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-400">
            No popular shows found.
          </p>
        )}
      </main>
    </div>
  );
}

export default PopularPage;
