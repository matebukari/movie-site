import { useState, useEffect } from "react";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";
import Navbar from "../components/Navbar";

function HomePage() {
  const [country, setCountry] = useState("us");
  const [searchQuery, setSearchQuery] = useState("");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [countryDetected, setCountryDetected] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const detectUserCountry = async () => {
      try {
        // 🌍 Use a free IP geolocation API (no key required)
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        if (data && data.country_code) {
          const detected = data.country_code.toLowerCase();
          setCountry(detected);
          setCountryDetected(true);
          console.log("🌎 Detected country:", data.country_name);
        } else {
          console.warn("⚠️ Could not detect country, defaulting to US");
          setCountry("us");
          setCountryDetected(true);
        }
      } catch (error) {
        console.error("Error detecting user location:", error);
        setCountry("us");
        setCountryDetected(true);
      }
    };

    detectUserCountry();
  }, []);


  const MAX_SHOWS = 102;


  const fetchShows = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const currentPage = reset ? 1 : page;
      const endpoint = searchQuery.trim() !== ""
        ? `${API_BASE}/titles/search?query=${encodeURIComponent(
          searchQuery
          )}&country=${country}&page=${currentPage}`
        : `${API_BASE}/titles/by-country?country=${country}&limit=12&page=${currentPage}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

      setShows((prev) => {
        const newShows = reset ? data.results : [...prev, ...data.results];
        const uniqueShows = Array.from(new Map(newShows.map((s) => [s.id, s])).values()); // dedupe
        const limited = uniqueShows.slice(0, MAX_SHOWS);

        if (limited.length >= MAX_SHOWS) setHasMore(false);
        return limited;
      });

      if (data.results.length === 0 || shows.length >= MAX_SHOWS) {
        setHasMore(false);
      } else {
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (countryDetected) {
      fetchShows(true);
    }
  }, [countryDetected]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loading) return; 

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= documentHeight - 200 && !loading && hasMore) {
        fetchShows();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, country]);

  useEffect(() => {
    setPage(1);
    setShows([]);
    setHasMore(true);
  }, [country]);

  const handleShowClick = async (show) => {
    console.log("Selected show:", show);

    try {
      const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
      const data = await res.json();
      console.log("Streaming platforms:", data.platforms);

      alert(`${show.title} is available on: ${data.platforms.join(", ")}`);
    } catch (error) {
      console.error("Error fetching show sources:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        country={country}
        setCountry={setCountry}
        onSearch={() => fetchShows(true)}
      />

      <main className="p-8">
        {error && <p className="text-center text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} onClick={() => handleShowClick(show)} />
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && shows.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-400">
            No shows found. Try another country.
          </p>
        )}
      </main>
    </div>
  );
}

export default HomePage;
