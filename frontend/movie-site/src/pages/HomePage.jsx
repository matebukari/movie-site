import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import ShowModal from "../components/ShowModal";
import ShowsGrid from "../components/ShowsGrid";
import { useCountry } from "../context/CountryContext";

import useCachedShows from "../hooks/useCachedShows";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import {fetchShowsGeneric} from "../hooks/useFetchShows";

const API_BASE = import.meta.env.VITE_API_URL;
const PAGE_LIMIT = 20;

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

  // Load cache on country switch
  useEffect(() => {
    const cache = getCache();
    if (cache) {
      setShows(cache.results);
      setPage(cache.nextPage ?? 6);
      setHasMore(cache.hasMore ?? true);
    } else {
      setShows([]);
      setPage(1);
      setHasMore(true);
    }
  }, [country]);

  // Fetch shows
  const fetchShows = useCallback(
    async (reset = false) => {
      if (loading || !countryDetected) return;

      setLoading(true);
      setError("");

      const currentPage = reset ? 1 : page;

      const endpoint = searchQuery.trim()
        ? `${API_BASE}/titles/search?query=${encodeURIComponent(
            searchQuery
          )}&country=${country}&page=${currentPage}`
        : `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      try {
        const { results, hasMore: more } = await fetchShowsGeneric(
          endpoint,
          reset ? [] : shows
        );

        setShows(results);
        setHasMore(more);
        setCache(results, currentPage + 1, more);
        setPage(currentPage + 1);

      } catch {
        setError("Error fetching shows");
      } finally {
        setLoading(false);
      }
    },
    [country, countryDetected, page, searchQuery, shows, loading]
  );

  // Initial preload (5 pages)
  useEffect(() => {
    if (!countryDetected || !country) return;
    if (getCache()) return;

    const preload = async () => {
      setLoading(true);
      setError("");

      try {
        const pages = [1, 2, 3, 4, 5];

        const results = await Promise.all(
          pages.map(async (p) => {
            const url = `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${p}`;
            const { results } = await fetchShowsGeneric(url);
            return results;
          })
        );

        const flattened = results.flat();
        setShows(flattened);
        setPage(6);
        setHasMore(flattened.length > 0);
        setCache(flattened, 6, flattened.length > 0);

      } catch {
        setError("Failed to load shows");
      } finally {
        setLoading(false);
      }
    };

    preload();
  }, [countryDetected, country]);

  // Infinite scroll
  useInfiniteScroll(() => {
    if (hasMore && !loading) fetchShows();
  }, [hasMore, loading, country]);

  // Modal fetch
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
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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
