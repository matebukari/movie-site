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

export default function HomePage() {
  const { country, countryDetected } = useCountry();
  const { runLocked } = useScrollLockDuringFetch();
  const { selectedShow, setSelectedShow, loadShowDetails } = useShowDetails(country);
  const { getCache, setCache } = useCachedShows("shows", country);
  const [searchQuery, setSearchQuery] = useState("");
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
  const fetchShows = (reset = false) =>
    fetchPage({
      reset,
      endpoint: searchQuery.trim()
        ? `/titles/search?query=${encodeURIComponent(searchQuery)}`
        : `/titles/by-country`,
    });

  // Load CACHE first
  useEffect(() => {
    if (!countryDetected) return;

    const cache = getCache();
    if (cache && !searchQuery.trim()) {
      setShows(cache.results);
      setHasMore(cache.hasMore);
      return;
    }

    // No cache → fetch fresh
    fetchShows(true);
  }, [countryDetected, country]);

  // Reset feed when search cleared
  useEffect(() => {
    if (!countryDetected) return;

    if (searchQuery.trim() === "") {
      fetchShows(true);
    }
  }, [searchQuery]);

  // Infinite scroll
  useInfiniteScroll(() => {
    if (!loading && hasMore) fetchShows();
  }, [loading, hasMore, shows.length]);

  // Prefetch at 30%
  useScrollPrefetch(
    () => runLocked(() => fetchShows()),
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
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="p-8">
        <ShowsGrid
          shows={shows}
          loading={loading}
          error={error}
          emptyMessage="No shows found for your region."
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
