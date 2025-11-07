import { useState, useEffect } from "react";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";
import ShowModal from "../components/ShowModal";
import Navbar from "../components/Navbar";
import { useCountry } from "../context/CountryContext";

function PopularPage() {
  const { country, countryDetected } = useCountry();
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL;
  const MAX_SHOWS = 102;
  const PAGE_LIMIT = 20;

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
          return;
        }
      } catch {
        console.warn("🧹 Invalid cache, clearing...");
        sessionStorage.removeItem(cacheKey);
      }
    }
  }, [country]);

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

        const unique = Array.from(
          newShows.reduce((map, show) => {
            const existing = map.get(show.id);
            const completenessScore = (obj) =>
              Object.values(obj || {}).filter((v) => v !== null && v !== undefined).length;

            if (!existing || completenessScore(show) > completenessScore(existing)) {
              map.set(show.id, show);
            }
            return map;
          }, new Map()).values()
        );

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

  useEffect(() => {
    console.log("🚀 Popular preload triggered:", { countryDetected, country });
    if (!countryDetected || !country) return;

    const cacheKey = `popular-${country}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.results?.length > 0) return;
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

        const results = await Promise.all(
          pages.map(async (p) => {
            const res = await fetch(`${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${p}`);
            const data = await res.json();
            return data.results || [];
          })
        );

        const combined = results.flat();

        const unique = Array.from(
          combined.reduce((map, show) => {
            const existing = map.get(show.id);
            const completenessScore = (obj) =>
              Object.values(obj || {}).filter((v) => v !== null && v !== undefined).length;

            if (!existing || completenessScore(show) > completenessScore(existing)) {
              map.set(show.id, show);
            }

            return map;
          }, new Map()).values()
        );

        const limited = unique.slice(0, MAX_SHOWS);

        console.log(`✅ Preloaded ${limited.length} popular shows for ${country}`);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} onClick={() => setSelectedShow(show)} />
          ))}
        </div>

        {loading && shows.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && shows.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-400">No popular shows found.</p>
        )}

        {selectedShow && (
          <ShowModal
            show={selectedShow}
            country={country}
            onClose={() => setSelectedShow(null)}
          />
        )}
      </main>
    </div>
  );
}

export default PopularPage;