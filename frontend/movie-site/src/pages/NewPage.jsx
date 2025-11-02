import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";

function NewPage() {
  const [country, setCountry] = useState("us");
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchNewShows = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const currentPage = reset ? 1 : page;
      const res = await fetch(
        `${API_BASE}/titles/new?country=${country}&limit=12&page=${currentPage}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch new shows");

      setShows((prev) => (reset ? data.results : [...prev, ...data.results]));
      setPage(currentPage + 1);
    } catch (err) {
      console.error(err);
      setError("Error fetching new shows");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewShows(true);
  }, [country]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        country={country}
        setCountry={setCountry}
        onSearch={() => {}}
      />

      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-blue-400">
          🆕 New Releases in {country.toUpperCase()}
        </h1>

        {error && <p className="text-center text-red-400">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default NewPage;
