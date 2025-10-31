import { useState } from "react";
import CountryDropdown from "../components/CountryDropdown";
import ShowCard from "../components/ShowCard";

function HomePage() {
  const [country, setCountry] = useState("us");
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const fetchShows = async () => {
    setLoading(true);
    setError("");
    setShows([]);

    try {
      const res = await fetch(`${API_BASE}/titles/by-country?country=${country}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch shows");
      setShows(data.results || []);
    } catch (err) {
      console.error(err);
      setError("Error fetching shows");
    } finally {
      setLoading(false);
    }
  };

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
          onClick={fetchShows}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold"
        >
          Show Titles
        </button>
      </div>

      {/* Loading & Error */}
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}

      {/* Show Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} onClick={() => handleShowClick(show)} />
        ))}
      </div>

      {!loading && shows.length === 0 && !error && (
        <p className="text-center mt-10 text-gray-400">
          No shows found. Try another country.
        </p>
      )}
    </div>
  );
}

export default HomePage;
