import { useState, useEffect } from "react";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";
import Navbar from "../components/Navbar";

function HomePage() {
  const [country, setCountry] = useState("us");
  const [searchQuery, setSearchQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [countryDetected, setCountryDetected] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;
  const MAX_SHOWS = 102;
  const PAGE_LIMIT = 20; // Fetch 20 per page

  /* 🌍 Detect User Country via backend proxy (uses ipwho.is) */
  useEffect(() => {
    const detectUserCountry = async () => {
      try {
        const res = await fetch(`${API_BASE}/utils/detect-country`);
        const data = await res.json();
        setCountry(data.country || "us");
      } catch (err) {
        console.warn("⚠️ Country detection failed, defaulting to US");
        setCountry("us");
      } finally {
        setCountryDetected(true);
      }
    };
    detectUserCountry();
  }, []);

  /* 🎬 Fetch Shows (by country or search) */
  const fetchShows = async (reset = false, customPage = null) => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const currentPage = customPage || (reset ? 1 : page);
      const endpoint =
        searchQuery.trim() !== ""
          ? `${API_BASE}/titles/search?query=${encodeURIComponent(searchQuery)}&country=${country}&page=${currentPage}`
          : `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

      setShows((prev) => {
        const newShows = reset ? data.results : [...prev, ...data.results];
        const unique = Array.from(new Map(newShows.map((s) => [s.id, s])).values());
        const limited = unique.slice(0, MAX_SHOWS);
        setHasMore(limited.length < MAX_SHOWS && data.results.length > 0);
        return limited;
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error fetching shows:", err);
      setError("Error fetching shows");
    } finally {
      setLoading(false);
    }
  };

  /* 🚀 Load multiple pages in parallel on first load */
  useEffect(() => {
    if (!countryDetected) return;

    const loadInitialShows = async () => {
      setLoading(true);
      setShows([]);
      setPage(1);
      setHasMore(true);

      try {
        // Fetch first 5 pages in parallel (20 x 5 = 100)
        const pages = [1, 2, 3, 4, 5];
        const fetches = pages.map((p) =>
          fetch(`${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${p}`).then((res) =>
            res.json()
          )
        );

        const results = await Promise.all(fetches);
        const allShows = results.flatMap((r) => r.results || []);
        const unique = Array.from(new Map(allShows.map((s) => [s.id, s])).values());
        const limited = unique.slice(0, MAX_SHOWS);

        setShows(limited);
        setPage(6); // Next fetch will start from page 6
        setHasMore(limited.length < MAX_SHOWS);
      } catch (err) {
        console.error("❌ Parallel preload failed:", err);
        setError("Failed to load initial shows");
      } finally {
        setLoading(false);
      }
    };

    loadInitialShows();
  }, [countryDetected, country]);

  /* 🧭 Infinite scroll for more content */
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400;

      if (nearBottom) fetchShows();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, country]);

  /* 🎞️ Show platform popup */
  const handleShowClick = async (show) => {
    try {
      const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
      const data = await res.json();
      alert(`${show.title} is available on: ${data.platforms.join(", ")}`);
    } catch (err) {
      console.error("Error fetching show sources:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        country={country}
        setCountry={setCountry}
        onSearch={() => fetchShows(true)}
      />

      <main className="p-8">
        {error && <p className="text-center text-red-400">{error}</p>}

        {/* Grid of shows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} onClick={() => handleShowClick(show)} />
          ))}
        </div>

        {/* Skeleton loader */}
        {loading && shows.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && shows.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-400">
            No shows found. Try another country.
          </p>
        )}
      </main>
    </div>
  );
}

export default HomePage;
