import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import CountrySelector from "./CountrySelector";

const API_BASE = import.meta.env.VITE_API_URL;

export default function SearchBar({
  searchQuery = "",
  setSearchQuery,
  country,
  setCountry,
  onSearch,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestionRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (query = searchQuery) => {
    const safeQuery = (query || "").trim();
    if (!safeQuery) return;

    navigate(`/search?q=${encodeURIComponent(safeQuery)}&country=${country}`);

    setShowSuggestions(false);
    setActiveIndex(-1);
  };


  // Debounced suggestion fetching
  useEffect(() => {
    const safeQuery = (searchQuery || "").trim();
    if (safeQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const res = await fetch(
          `${API_BASE}/titles/search?query=${encodeURIComponent(
            safeQuery
          )}&country=${country}`
        );
        const data = await res.json();
        if (Array.isArray(data.results)) {
          setSuggestions(data.results.slice(0, 6));
          setShowSuggestions(true);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, country]);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSearch(suggestions[activeIndex].title || suggestions[activeIndex].name);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!suggestionRef.current?.contains(e.target)) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col sm:flex-row justify-center items-stretch w-full sm:w-auto gap-2 sm:gap-0">
      {/* Search Input */}
      <div className="relative flex items-center w-full sm:w-80">
        <input
          type="text"
          placeholder="Search for a show..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-md sm:rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all h-11 pr-10"
        />

        <button
          onClick={() => handleSearch()}
          aria-label="Search"
          className="absolute right-3 text-gray-400 hover:text-blue-400"
        >
          <Search size={18} />
        </button>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionRef}
            className="absolute top-full mt-1 w-full bg-gray-900 border border-gray-700 rounded-md shadow-lg z-30 max-h-64 overflow-y-auto"
          >
            {loadingSuggestions && (
              <li className="px-4 py-2 text-gray-400 text-sm italic">Loading...</li>
            )}

            {suggestions.map((s, i) => (
              <li
                key={`${s.id || s.title || s.name}-${i}`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => handleSearch(s.title || s.name)}
                className={`px-4 py-2 cursor-pointer text-gray-200 text-sm transition-colors ${
                  activeIndex === i ? "bg-gray-700 text-white" : "hover:bg-gray-800"
                }`}
              >
                {s.title || s.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Country Selector */}
      <CountrySelector
        country={country}
        setCountry={setCountry}
        onCountryChange={(newCountry) => {
          if (window.location.pathname === "/search") {
            if (searchQuery.trim()) {
              navigate(`/search?q=${encodeURIComponent(searchQuery)}&country=${newCountry}`);
            }
          }
        }}
      />
    </div>
  );
}
