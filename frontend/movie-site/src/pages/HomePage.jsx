import { useState, useEffect } from "react";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";
import ShowModal from "../components/ShowModal";
import Navbar from "../components/Navbar";
import { useCountry } from "../context/CountryContext";

function HomePage() {
  const { country, countryDetected } = useCountry();
  const [searchQuery, setSearchQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL;
  const MAX_SHOWS = 102;
  const PAGE_LIMIT = 20;

  useEffect(() => {
    const cacheKey = `shows-${country}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.results) && parsed.country === country) {
          console.log("⚡ Loaded shows from session cache");
          setShows(parsed.results);
          setPage(parsed.nextPage || 6);
          setHasMore(parsed.hasMore ?? true);
          return;
        }
      } catch {
        sessionStorage.removeItem(cacheKey);
      }
    }
  }, [country]);

  const fetchShows = async (reset = false, customPage = null) => {
    if (loading || !countryDetected) return;
    setLoading(true);
    setError("");

    try {
      const currentPage = customPage || (reset ? 1 : page);
      const endpoint =
        searchQuery.trim() !== ""
          ? `${API_BASE}/titles/search?query=${encodeURIComponent(searchQuery)}&country=${country}&page=${currentPage}`
          : `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${currentPage}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

      setShows((prev) => {
        const newShows = reset ? data.results : [...prev, ...data.results];
        const unique = Array.from(new Map(newShows.map((s) => [s.id, s])).values());
        const limited = unique.slice(0, MAX_SHOWS);
        setHasMore(limited.length < MAX_SHOWS && data.results.length > 0);

        sessionStorage.setItem(
          `shows-${country}`,
          JSON.stringify({
            country,
            results: limited,
            nextPage: currentPage + 1,
            hasMore: limited.length < MAX_SHOWS,
          })
        );

        return limited;
      });

      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Error fetching shows:", err);
      setError("Error fetching shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  if (!countryDetected || !country) return;

  const cacheKey = `shows-${country}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return;

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
          const res = await fetch(
            `${API_BASE}/titles/by-country?country=${country}&limit=${PAGE_LIMIT}&page=${p}`
          );
          const data = await res.json();
          return data.results || [];
        })
      );

      const combined = results.flat();

      const unique = Array.from(
        combined.reduce((map, show) => {
          const existing = map.get(show.id);

          const completenessScore = (obj) =>
            Object.values(obj || {}).filter((v) => v !== null && v !== undefined).length;

          if (!existing || completenessScore(show) > completenessScore(existing)) {
            map.set(show.id, show);
          }

          return map;
        }, new Map()).values()
      );

      const limited = unique.slice(0, MAX_SHOWS);

      setShows(limited);
      setPage(6);
      setHasMore(limited.length < MAX_SHOWS);

      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({
          country,
          results: limited,
          nextPage: 6,
          hasMore: limited.length < MAX_SHOWS,
        })
      );
    } catch (err) {
      console.error("❌ Initial load failed:", err);
      setError("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  loadInitial();
}, [countryDetected, country]);


  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        fetchShows();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, country]);

  const handleShowClick = async (show) => {
  try {
    const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
    const data = await res.json();

    const showWithPlatforms = {
      ...show,
      platforms: data.platforms || [],
    };

    setSelectedShow(showWithPlatforms);
  } catch (err) {
    console.error("❌ Error fetching show details:", err);
  }
};


  if (!countryDetected) {
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
        onSearch={() => fetchShows(true)}
      />

      <main className="p-8">
        {error && <p className="text-center text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} onClick={() => handleShowClick(show)} />
          ))}
        </div>

        {loading && shows.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && shows.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-400">
            No shows found for your region.
          </p>
        )}

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

export default HomePage;
