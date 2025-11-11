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

export default function NewPage() {
  const { country, countryDetected } = useCountry();
  const { getCache, setCache } = useCachedShows("new", country);

  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  // Load from Cache
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setShows(cache.results);
      setPage(cache.nextPage ?? 6);
      setHasMore(cache.hasMore ?? true);
    }
  }, [country]);

  // Fetch new releases
  const fetchNewTitles = useCallback(
    async (reset = false, customPage = null) => {
      if (loading || !countryDetected) return;

      setLoading(true);
      setError("");

      const currentPage = customPage || (reset ? 1 : page);
      const endpoint = `${API_BASE}/titles/new?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      try {
        const { results, hasMore: more } = await fetchShowsGeneric(endpoint, reset ? [] : shows);
        setShows(results);
        setHasMore(more);
        setCache(results, currentPage + 1, more);
        setPage((p) => p + 1);
      } catch (err) {
        console.error("Error fetching new releases:", err);
        setError("Error fetching new releases");
      } finally {
        setLoading(false);
      }
    },
    [country, countryDetected, page, shows, loading]
  );

  // Initial Preload (first 5 pages)
  useEffect(() => {
    if (!countryDetected || !country) return;
    if (getCache()) return;

    const loadInitial = async () => {
      setLoading(true);
      setError("");
      setShows([]);
      setPage(1);
      setHasMore(true);

      try {
        const pages = [1, 2, 3, 4, 5];
        const allResults = await Promise.all(
          pages.map(async (p) => {
            const endpoint = `${API_BASE}/titles/new?country=${country}&limit=${PAGE_LIMIT}&page=${p}`;
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
        console.error("Failed to preload new releases:", err);
        setError("Failed to load new releases");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [countryDetected, country]);

  // Infinite Scroll
  useInfiniteScroll(() => {
    if (!loading && hasMore) fetchNewTitles();
  }, [loading, hasMore, country]);

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
        <h1 className="text-3xl font-semibold mb-6 text-center text-blue-400">
          New Releases in {country?.toUpperCase() || "US"}
        </h1>

        <ShowsGrid
          shows={shows}
          loading={loading}
          error={error}
          emptyMessage="No new releases found."
          onShowClick={setSelectedShow}
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