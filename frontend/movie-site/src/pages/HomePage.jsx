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

const PAGE_LIMIT = 9;
const MAX_SHOWS = 102;

// Only fetch what ShowCard needs → tiny response, much faster
const FAST_FIELDS = "id,title,poster,backdrop,year,type";

const dedupe = (arr) =>
  Array.from(new Map(arr.map((s) => [s.id, s])).values());

export default function HomePage() {
  const { country, countryDetected } = useCountry();
  const { getCache, setCache } = useCachedShows("shows", country);

  const [searchQuery, setSearchQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [isPrefetching, setIsPrefetching] = useState(false); // ⭐ NEW
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  const { runLocked } = useScrollLockDuringFetch();

  /* ----------------------------------------------
      1️⃣ Load from cache instantly when country changes
  ------------------------------------------------*/
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

  /* ----------------------------------------------
      2️⃣ Fetch shows (Fast-lane minimal payload)
  ------------------------------------------------*/
  const fetchShows = useCallback(
    async (reset = false) => {
      if (!countryDetected) return;

      return runLocked(async () => {
        if (loading) return;

        if (!reset && shows.length >= MAX_SHOWS) {
          setHasMore(false);
          return;
        }

        setLoading(true);
        setError("");

        const currentPage = reset ? 1 : page;

        const baseUrl = searchQuery.trim()
          ? `${API_BASE}/titles/search?query=${encodeURIComponent(
              searchQuery
            )}&country=${country}`
          : `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}`;

        const endpoint = `${baseUrl}&page=${currentPage}&fields=${FAST_FIELDS}`;

        try {
          const { results: newResults } = await fetchShowsGeneric(
            endpoint,
            reset ? [] : shows
          );

          if (!newResults.length) {
            setHasMore(false);
            return;
          }

          let merged = reset
            ? newResults
            : dedupe([...shows, ...newResults]);

          if (merged.length >= MAX_SHOWS) {
            merged = merged.slice(0, MAX_SHOWS);
            setHasMore(false);
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
    [countryDetected, country, searchQuery, shows, page, loading]
  );

  /* ----------------------------------------------
      3️⃣ Initial fast preload
  ------------------------------------------------*/
  useEffect(() => {
    if (!countryDetected) return;
    if (getCache()) return;

    fetchShows(true);
  }, [countryDetected, country]);

  /* ----------------------------------------------
      4️⃣ Infinite scroll (bottom trigger)
  ------------------------------------------------*/
  useInfiniteScroll(() => {
    if (!loading && hasMore && shows.length < MAX_SHOWS) {
      fetchShows();
    }
  }, [loading, hasMore, shows.length, country]);

  /* ----------------------------------------------
      5️⃣ Netflix-style prefetch while scrolling down
  ------------------------------------------------*/
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const current = window.scrollY;

      // Only trigger when scrolling DOWN
      if (current <= lastScroll) {
        lastScroll = current;
        return;
      }

      lastScroll = current;

      const scrollPosition = window.scrollY + window.innerHeight;
      const fullHeight = document.body.scrollHeight;
      const scrolledRatio = scrollPosition / fullHeight;

      // Prefetch next page early (only once)
      if (
        scrolledRatio > 0.3 &&     // 30% scroll
        !loading &&
        !isPrefetching &&          // prevent duplicate prefetch
        hasMore &&
        shows.length < MAX_SHOWS
      ) {
        setIsPrefetching(true);

        fetchShows().finally(() => {
          setIsPrefetching(false);
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, isPrefetching, hasMore, shows.length, fetchShows]);

  /* ----------------------------------------------
      6️⃣ Fetch full details for modal (Slow-lane)
  ------------------------------------------------*/
  const handleShowClick = async (show) => {
    try {
      // FULL DETAILS
      const detailsRes = await fetch(`${API_BASE}/titles/${show.id}`);
      const details = await detailsRes.json();

      // PLATFORMS
      const platformsRes = await fetch(
        `${API_BASE}/titles/${show.id}/sources?country=${country}`
      );
      const platformData = await platformsRes.json();

      setSelectedShow({
        ...show,
        ...details,
        platforms: platformData.platforms || [],
      });

    } catch {
      console.error("Error fetching modal details");
    }
  };

  /* ----------------------------------------------
      7️⃣ Waiting screen while detecting region
  ------------------------------------------------*/
  if (!countryDetected && shows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Detecting your location...
      </div>
    );
  }

  /* ----------------------------------------------
      8️⃣ Render UI
  ------------------------------------------------*/
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
