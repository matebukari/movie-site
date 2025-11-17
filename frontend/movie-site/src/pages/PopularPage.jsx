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

// ⭐ Fetch exactly 9 shows per page (matches screen grid)
const PAGE_LIMIT = 9;
const MAX_SHOWS = 102;

// ⭐ Lightweight fields for grid cards
const FAST_FIELDS = "id,title,poster,backdrop,year,type";

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

  /* ---------------------------------------------------
    1️⃣ Load from cache if available
  -----------------------------------------------------*/
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

  /* ---------------------------------------------------
    2️⃣ Fast-lane fetch: minimal card data
  -----------------------------------------------------*/
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

      const endpoint = `${API_BASE}/titles/popular?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}&fields=${FAST_FIELDS}`;

      try {
        const { results: newResults } = await fetchShowsGeneric(
          endpoint,
          reset ? [] : shows
        );

        if (!newResults.length) {
          setHasMore(false);
          return;
        }

        let merged = reset ? newResults : dedupe([...shows, ...newResults]);

        if (merged.length >= MAX_SHOWS) {
          merged = merged.slice(0, MAX_SHOWS);
          setHasMore(false);
        }

        setShows(merged);
        setCache(merged, currentPage + 1, true);

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

  /* ---------------------------------------------------
    3️⃣ Initial fast-lane fetch
  -----------------------------------------------------*/
  useEffect(() => {
    if (!countryDetected) return;
    if (getCache()) return;

    fetchPopular(true); // reset = true → page 1
  }, [countryDetected, country]);

  /* ---------------------------------------------------
    4️⃣ Infinite scroll & early prefetch
  -----------------------------------------------------*/
  useInfiniteScroll(() => {
    if (!loading && hasMore && shows.length < MAX_SHOWS) {
      fetchPopular();
    }
  }, [loading, hasMore, shows.length]);

  // ⭐ Prefetch next page early at 30% scroll
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const y = window.scrollY;

      if (y <= lastScroll) {
        lastScroll = y;
        return;
      }

      lastScroll = y;

      const ratio =
        (window.scrollY + window.innerHeight) /
        document.body.scrollHeight;

      if (ratio > 0.3 && !loading && hasMore && shows.length < MAX_SHOWS) {
        fetchPopular();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, shows.length, fetchPopular]);

  /* ---------------------------------------------------
    5️⃣ Slow-lane fetch for modal details
  -----------------------------------------------------*/
  const handleShowClick = async (show) => {
    try {
      const detailsRes = await fetch(`${API_BASE}/titles/${show.id}`);
      const details = await detailsRes.json();

      const platformsRes = await fetch(
        `${API_BASE}/titles/${show.id}/sources?country=${country}`
      );
      const platformsData = await platformsRes.json();

      setSelectedShow({
        ...show,
        ...details,
        platforms: platformsData.platforms || [],
      });
    } catch (err) {
      console.error("❌ Error fetching show details:", err);
    }
  };

  /* ---------------------------------------------------
    6️⃣ Geo detection wait screen
  -----------------------------------------------------*/
  if (!countryDetected && shows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Detecting your location...
      </div>
    );
  }

  /* ---------------------------------------------------
    7️⃣ Render UI
  -----------------------------------------------------*/
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="p-8">
        <h1 className="flex items-center gap-3 mb-10 text-3xl font-bold justify-center md:justify-start">
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
