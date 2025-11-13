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

// 🔥 FIX: Universal deduplication helper
const dedupeById = (arr) =>
  Array.from(new Map(arr.map((item) => [item.id, item])).values());

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

  // Load cached shows when switching countries
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      const unique = dedupeById(cache.results);
      setShows(unique);
      setPage(cache.nextPage ?? 6);
      setHasMore(cache.hasMore ?? true);
    } else {
      setShows([]);
      setPage(1);
      setHasMore(true);
    }
  }, [country]);

  // Main fetch function (search + by-country)
  const fetchShows = useCallback(
    async (reset = false, customPage = null, customQuery = null, customCountry = null) => {
      if (loading || !countryDetected) return;

      setLoading(true);
      setError("");

      const query = customQuery ?? searchQuery;
      const selectedCountry = customCountry ?? country;
      const currentPage = customPage || (reset ? 1 : page);

      const endpoint =
        query.trim()
          ? `${API_BASE}/titles/search?query=${encodeURIComponent(query)}&country=${selectedCountry}&page=${currentPage}`
          : `${API_BASE}/titles/by-country?country=${selectedCountry}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      try {
        // Fetch + merge
        const { results, hasMore: more } = await fetchShowsGeneric(
          endpoint,
          reset ? [] : shows
        );

        // Dedupe AFTER merging
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

  //  Preload 5 pages on first load (deduped)
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
            const endpoint = `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${p}`;
            const { results } = await fetchShowsGeneric(endpoint);
            return results;
          })
        );

        // Dedupe combined pages
        const combined = dedupeById(allResults.flat());

        setShows(combined);
        setPage(6);
        setHasMore(combined.length > 0);

        // Save to cache
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

  // Infinite scroll fetch
  useInfiniteScroll(() => {
    if (!loading && hasMore) fetchShows();
  }, [loading, hasMore, country]);

  // Modal fetch (per show)
  const handleShowClick = async (show) => {
    try {
      const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
      const data = await res.json();
      setSelectedShow({ ...show, platforms: data.platforms || [] });
    } catch (err) {
      console.error("Error fetching show details:", err);
    }
  };

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
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={(query, selectedCountry) =>
          fetchShows(true, 1, query, selectedCountry)
        }
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