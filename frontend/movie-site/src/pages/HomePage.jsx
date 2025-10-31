import { useState, useEffect } from "react";
import CountryDropdown from "../components/CountryDropdown";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";

function HomePage() {
  const [country, setCountry] = useState("us");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchShows = async (reset = false) => {
    if (loading) return; // Prevent multiple requests
    setLoading(true);
    setError("");

    try {
      const currentPage = reset ? 1 : page;
      const res = await fetch(
        `${API_BASE}/titles/by-country?country=${country}&limit=12&page=${currentPage}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

      if (data.results.length === 0) {
        setHasMore(false);
      } else {
        setShows((prev) =>{
          const updated = reset ? data.results : [...prev, ...data.results]

          if (updated.length >= 51){
            return updated.slice(0, 51);
          }
          return updated;
        }
        );
        setPage(currentPage + 1);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching shows");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 When user scrolls near bottom, load more
  useEffect(() => {
    const handleScroll = () => {
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

  // 🔄 Reset when country changes
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
      <h1 className="text-4xl font-bold mb-8 text-center">
        🎬 Streaming Availability by Country
      </h1>

      {/* Dropdown + Button */}
      <div className="flex justify-center items-end gap-3 mb-8">
        <CountryDropdown country={country} setCountry={setCountry} />
        <button
          onClick={() => fetchShows(true)} // reset to page 1
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold"
        >
          Show Titles
        </button>
      </div>

      {/* Loading & Error */}
      {error && <p className="text-center text-red-400">{error}</p>}

      {/* Show Results */}
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
    </div>
  );
}

export default HomePage;
