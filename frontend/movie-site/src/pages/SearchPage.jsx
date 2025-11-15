import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ShowCard from "../components/ShowCard";
import SkeletonCard from "../components/SkeletonCard";
import ShowModal from "../components/ShowModal";
import Navbar from "../components/Navbar";
import { useCountry } from "../context/CountryContext";

const API_BASE = import.meta.env.VITE_API_URL;

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const { country, countryDetected } = useCountry();

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedShow, setSelectedShow] = useState(null);

  // Sync search bar with URL
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  useEffect(() => {
    if (!searchQuery || !countryDetected) return;

    setLoading(true);
    setError("");
    setShows([]);

    const fetchSearchResults = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/titles/search?query=${encodeURIComponent(
            searchQuery
          )}&country=${country}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch search results");
        setShows(data.results || []);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery, country, countryDetected]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={(q, selectedCountry) => {
          const params = new URLSearchParams();
          params.set("q", q);
          params.set("country", selectedCountry || country);
          window.history.replaceState({}, "", `/search?${params.toString()}`);
        }}
      />

      <main className="p-8">
        {/* Header Styled Like Popular/New */}
        {searchQuery && (
          <h1
            className="
              flex items-center gap-3 mb-10
              text-3xl font-bold
              justify-center md:justify-start
              text-center md:text-left
            "
          >
            <span className="text-red-400 tracking-wide drop-shadow-[0_0_10px_#ef4444]">
              Results for
            </span>

            <span className="text-white">“{searchQuery}”</span>

            <img
              src={`https://flagcdn.com/w40/${country?.toLowerCase()}.png`}
              alt={country}
              className="h-6 w-8 object-cover rounded-md border border-gray-700"
            />
          </h1>
        )}

        {error && <p className="text-center text-red-400">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : shows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <ShowCard key={show.id} show={show} onClick={() => setSelectedShow(show)} />
            ))}
          </div>
        ) : (
          !loading && (
            <p className="text-center text-gray-400 mt-10">
              {searchQuery ? "No results found." : "Start by typing a search query above."}
            </p>
          )
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
