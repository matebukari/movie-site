import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ShowModal from "../components/ShowModal";
import ShowsGrid from "../components/ShowsGrid";
import { useCountry } from "../context/CountryContext";

import useShowFetcher from "../hooks/useShowFetcher";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import useScrollLockDuringFetch from "../hooks/useScrollLockDuringFetch";
import useScrollPrefetch from "../hooks/useScrollPrefetch";
import useShowDetails from "../hooks/useShowDetails";
import useCachedShows from "../hooks/useCachedShows";

export default function NewPage() {
  const { country, countryDetected } = useCountry();
  const { runLocked } = useScrollLockDuringFetch();
  const { selectedShow, setSelectedShow, loadShowDetails } = useShowDetails(country);
  const { getCache, setCache } = useCachedShows("new", country);

  const [searchQuery] = useState(""); // new releases page does not use search

  const {
    shows,
    setShows,
    loading,
    hasMore,
    setHasMore,
    error,
    fetchPage,
  } = useShowFetcher({
    country,
    countryDetected,
    setCache,
    runLocked,
  });

  // main fetcher
  const fetchNew = (reset = false) =>
    fetchPage({
      reset,
      endpoint: "/titles/new",
    });

  // Load CACHE first
  useEffect(() => {
    if (!countryDetected) return;

    const cache = getCache();
    if (cache) {
      console.log("💾 Using cached NEW releases");
      setShows(cache.results);
      setHasMore(cache.hasMore);
      return;
    }

    // No cache → fetch fresh
    fetchNew(true);
  }, [countryDetected, country]);

  // Infinite scroll
  useInfiniteScroll(() => {
    if (!loading && hasMore) fetchNew();
  }, [loading, hasMore, shows.length]);

  // Prefetch at 30%
  useScrollPrefetch(
    () => runLocked(() => fetchNew()),
    { loading, hasMore, length: shows.length, max: 102 },
    0.3
  );

  // Waiting screen while detecting region
  if (!countryDetected && shows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        Detecting your location...
      </div>
    );
  }

  // Render UI
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="p-8">
        <h1 className="flex items-center gap-3 mb-10 text-3xl font-bold justify-center md:justify-start">
          <span className="text-red-400 tracking-wide drop-shadow-[0_0_10px_#ef4444]">
            New Releases in
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
          emptyMessage="No new releases found."
          onShowClick={loadShowDetails}
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
