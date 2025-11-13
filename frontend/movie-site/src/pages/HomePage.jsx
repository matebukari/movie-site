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

// 🔥 Clean helper (dedupe by id)
const dedupeById = (arr) =>
  Array.from(new Map(arr.map((s) => [s.id, s])).values());

export default function HomePage() {
  const { country, countryDetected } = useCountry();
  const { getCache, setCache } = useCachedShows("shows", country);

  const [searchQuery, setSearchQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  /* -----------------------------------------------------------
   *  Load Cached Data on Country Switch
   * --------------------------------------------------------- */
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setShows(dedupeById(cache.results));
      setPage(cache.nextPage ?? 6);
      setHasMore(cache.hasMore ?? true);
    } else {
      setShows([]);
      setPage(1);
      setHasMore(true);
    }
  }, [country]);

  /* -----------------------------------------------------------
   *  Core Fetch Function (Search + Country Lists)
   * --------------------------------------------------------- */
  const fetchShows = useCallback(
    async (
      reset = false,
      customPage = null,
      customQuery = null,
      customCountry = null
    ) => {
      if (loading || !countryDetected) return;

      setLoading(true);
      setError("");

      const query = customQuery ?? searchQuery;
      const selectedCountry = customCountry ?? country;
      const currentPage = customPage || (reset ? 1 : page);

      const endpoint =
        query.trim()
          ? `${API_BASE}/titles/search?query=${encodeURIComponent(
              query
            )}&country=${selectedCountry}&page=${currentPage}`
          : `${API_BASE}/titles/by-country?country=${selectedCountry}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      try {
        const { results, hasMore: more } = await fetchShowsGeneric(
          endpoint,
          reset ? [] : shows
        );

        const unique = dedupeById(results);

        setShows(unique);
        setHasMore(more);
        setCache(unique, currentPage + 1, more);
        setPage(currentPage + 1);
      } catch (err) {
        console.error("Error fetching shows:", err);
        setError("Error fetching shows");
      } finally {
        setLoading(false);
      }
    },
    [country, countryDetected, page, searchQuery, shows, loading]
  );

  /* -----------------------------------------------------------
   *  Initial Preload (5 pages)
   * --------------------------------------------------------- */
  useEffect(() => {
    if (!countryDetected || !country) return;
    if (getCache()) return; // Already loaded

    const loadInitial = async () => {
      setLoading(true);
      setError("");
      setShows([]);
      setPage(1);
      setHasMore(true);

      try {
        const pages = [1, 2, 3, 4, 5];

        const results = await Promise.all(
          pages.map(async (p) => {
            const url = `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${p}`;
            const { results } = await fetchShowsGeneric(url);
            return results;
          })
        );

        const combined = dedupeById(results.flat());

        setShows(combined);
        setPage(6);
        setHasMore(combined.length > 0);
        setCache(combined, 6, combined.length > 0);
      } catch (err) {
        console.error("Failed to preload shows:", err);
        setError("Failed to load shows");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [countryDetected, country]);

  /* -----------------------------------------------------------
   *  Infinite Scroll
   * --------------------------------------------------------- */
  useInfiniteScroll(() => {
    if (!loading && hasMore) fetchShows();
  }, [loading, hasMore, country]);

  /* -----------------------------------------------------------
   *  Show Modal Fetch
   * --------------------------------------------------------- */
  const handleShowClick = async (show) => {
    try {
      const res = await fetch(
        `${API_BASE}/titles/${show.id}/sources?country=${country}`
      );
      const data = await res.json();

      setSelectedShow({
        ...show,
        platforms: data.platforms || [],
      });
    } catch (err) {
      console.error("Error fetching show details:", err);
    }
  };

  /* -----------------------------------------------------------
   *  Loading screen while detecting country
   * --------------------------------------------------------- */
  if (!countryDetected && shows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Detecting your location...
      </div>
    );
  }

  /* -----------------------------------------------------------
   *  Render
   * --------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="p-8">
        <ShowsGrid
          shows={shows}
          loading={loading}
          error={error}
          emptyMessage="No shows found for your region."
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
