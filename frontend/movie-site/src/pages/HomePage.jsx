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

  const { runLocked } = useScrollLockDuringFetch();

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

  const fetchShows = useCallback(
    async (reset = false) => {
      if (!countryDetected) return;

      runLocked(async () => {
        if (loading) return;

        if (!reset && shows.length >= MAX_SHOWS) {
          setHasMore(false);
          return;
        }

        setLoading(true);
        setError("");

        const currentPage = reset ? 1 : page;

        const endpoint = searchQuery.trim()
          ? `${API_BASE}/titles/search?query=${encodeURIComponent(
              searchQuery
            )}&country=${country}&page=${currentPage}`
          : `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

        try {
          const { results: newResults } = await fetchShowsGeneric(
            endpoint,
            reset ? [] : shows
          );

          if (newResults.length === 0) {
            setHasMore(false);
            setLoading(false);
            return;
          }

          let merged = reset
            ? newResults
            : dedupe([...shows, ...newResults]);

          if (merged.length >= MAX_SHOWS) {
            merged = merged.slice(0, MAX_SHOWS);
            setHasMore(false);
          } else {
            setHasMore(true);
          }

          setShows(merged);
          setCache(merged, currentPage + 1, true);

          setPage(currentPage + 1);
        } catch {
          setError("Error fetching shows");
        } finally {
          setLoading(false);
        }
      });
    },
    [country, countryDetected, page, searchQuery, shows, loading]
  );

  useEffect(() => {
    if (!countryDetected) return;
    if (getCache()) return;

    const preload = async () => {
      setLoading(true);

      try {
        const url = `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=1`;
        const { results } = await fetchShowsGeneric(url);

        const capped = results.slice(0, MAX_SHOWS);

        setShows(capped);
        setPage(2);
        setHasMore(capped.length < MAX_SHOWS);

        setCache(capped, 2, capped.length < MAX_SHOWS);
      } catch {
        setError("Failed to load shows");
      } finally {
        setLoading(false);
      }
    };

    preload();
  }, [countryDetected, country]);

  useInfiniteScroll(() => {
    if (!loading && hasMore && shows.length < MAX_SHOWS) {
      fetchShows();
    }
  }, [loading, hasMore, shows.length, country]);

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
