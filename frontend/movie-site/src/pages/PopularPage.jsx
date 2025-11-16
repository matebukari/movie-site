import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import ShowModal from "../components/ShowModal";
import ShowsGrid from "../components/ShowsGrid";
import { useCountry } from "../context/CountryContext";

import useCachedShows from "../hooks/useCachedShows";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import useScrollLockDuringFetch from "../hooks/useScrollLockDuringFetch";
import { fetchShowsGeneric } from "../hooks/useFetchShows";

const API_BASE = import.meta.env.VITE_API_URL;
const PAGE_LIMIT = 20;
const MAX_SHOWS = 102;

const dedupe = (arr) =>
  Array.from(new Map(arr.map((s) => [s.id, s])).values());

export default function PopularPage() {
  const { country, countryDetected } = useCountry();
  const { getCache, setCache } = useCachedShows("popular", country);

  const { runLocked } = useScrollLockDuringFetch();

  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  // Load cache on country change
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setShows(cache.results);
      setPage(cache.nextPage ?? 2);
      setHasMore(cache.hasMore ?? true);
    } else {
      setShows([]);
      setPage(1);
      setHasMore(true);
    }
  }, [country]);

  // Fetch next page
  const fetchPopular = useCallback(
    async (reset = false) => {
      if (!countryDetected || loading) return;

      if (!reset && shows.length >= MAX_SHOWS) {
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError("");

      const currentPage = reset ? 1 : page;

      const endpoint = `${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      try {
        const { results: newResults, hasMore: apiMore } =
          await fetchShowsGeneric(endpoint, reset ? [] : shows);

        let merged = reset ? newResults : dedupe([...shows, ...newResults]);

        // Cap at 102
        if (merged.length >= MAX_SHOWS) {
          merged = merged.slice(0, MAX_SHOWS);
          setHasMore(false);
        } else {
          setHasMore(apiMore);
        }

        setShows(merged);
        setCache(merged, currentPage + 1, apiMore);

        setPage(currentPage + 1);
      } catch (err) {
        console.error("Error fetching popular:", err);
        setError("Error loading popular shows");
      } finally {
        setLoading(false);
      }
    },
    [country, countryDetected, page, shows, loading]
  );

  // Initial load – only page 1
  useEffect(() => {
    if (!countryDetected || getCache()) return;

    const loadFirstPage = async () => {
      setLoading(true);

      try {
        const url = `${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=1`;
        const { results } = await fetchShowsGeneric(url);

        const capped = results.slice(0, MAX_SHOWS);

        setShows(capped);
        setPage(2);
        setHasMore(capped.length < MAX_SHOWS);

        setCache(capped, 2, capped.length < MAX_SHOWS);
      } catch {
        setError("Failed to load popular shows");
      } finally {
        setLoading(false);
      }
    };

    loadFirstPage();
  }, [countryDetected, country]);

  // Infinite Scroll (debounced + lock)
  useInfiniteScroll(() => {
    if (!loading && hasMore && shows.length < MAX_SHOWS) {
      runLocked(() => fetchPopular());
    }
  }, [loading, hasMore, shows.length]);

  // Fetch details for modal
  const handleShowClick = async (show) => {
    try {
      const res = await fetch(
        `${API_BASE}/titles/${show.id}/sources?country=${country}`
      );
      const data = await res.json();
      setSelectedShow({ ...show, platforms: data.platforms || [] });
    } catch {
      console.error("Error fetching show details");
    }
  };

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
            justify-center md:justify-start
            text-center md:text-left"
        >
          <span className="text-red-400 tracking-wide drop-shadow-[0_0_10px_#ef4444]">
            Popular in
          </span>
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
