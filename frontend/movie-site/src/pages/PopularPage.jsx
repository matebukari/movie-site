import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import ShowModal from "../components/ShowModal";
import ShowsGrid from "../components/ShowsGrid";
import { useCountry } from "../context/CountryContext";

import useCachedShows from "../hooks/useCachedShows";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { fetchShowsGeneric } from "../hooks/useFetchShows";

const API_BASE = import.meta.env.VITE_API_URL;
const PAGE_LIMIT = 20;

export default function PopularPage() {
  const { country, countryDetected } = useCountry();
  const { getCache, setCache } = useCachedShows("popular", country);

  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  // Load from cache
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setShows(cache.results);
      setPage(cache.nextPage ?? 6);
      setHasMore(cache.hasMore ?? true);
    }
  }, [country]);

  // Fetch popular shows
  const fetchPopular = useCallback(
    async (reset = false, customPage = null) => {
      if (loading || !countryDetected) return;

      setLoading(true);
      setError("");

      const currentPage = customPage || (reset ? 1 : page);
      const endpoint = `${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      try {
        const { results, hasMore: more } = await fetchShowsGeneric(endpoint, reset ? [] : shows);
        setShows(results);
        setHasMore(more);
        setCache(results, currentPage + 1, more);
        setPage((p) => p + 1);
      } catch (err) {
        console.error("❌ Error fetching popular shows:", err);
        setError("Error fetching popular shows");
      } finally {
        setLoading(false);
      }
    },
    [country, countryDetected, page, shows, loading]
  );

  // Initial preload
  useEffect(() => {
    if (!countryDetected || !country) return;
    if (getCache()) return;

    const loadInitial = async () => {
      setLoading(true);
      setError("");
      setShows([]);

      try {
        const pages = [1, 2, 3, 4, 5];
        const allResults = await Promise.all(
          pages.map(async (p) => {
            const endpoint = `${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${p}`;
            const { results } = await fetchShowsGeneric(endpoint);
            return results;
          })
        );

        const combined = allResults.flat();
        setShows(combined);
        setPage(6);
        setHasMore(combined.length > 0);
        setCache(combined, 6, combined.length > 0);
      } catch (err) {
        setError("Failed to load popular shows");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [countryDetected, country]);

  // Infinite Scroll
  useInfiniteScroll(() => {
    if (!loading && hasMore) fetchPopular();
  }, [loading, hasMore, country]);

  // Modal
  const handleShowClick = (show) => setSelectedShow(show);

  // Render
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
        <h1
  className="
    flex items-center gap-3 mb-10
    text-3xl font-bold
    justify-center md:justify-start   /* Center on mobile → left on desktop */
    text-center md:text-left
  "
>
  {/* Glowing text */}
  <span className="text-red-400 tracking-wide drop-shadow-[0_0_10px_#ef4444]">
    Popular in
  </span>

  {/* Clean flag (no glow) */}
  <img
    src={`https://flagcdn.com/w40/${country?.toLowerCase()}.png`}
    alt={country}
    className="h-6 w-8 object-cover rounded-md border border-gray-700"
  />
</h1>






        <ShowsGrid
          shows={shows}
          loading={loading}
          error={error}
          emptyMessage="No popular shows found."
          onShowClick={handleShowClick}
        />

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