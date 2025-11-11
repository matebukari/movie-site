import { useState, useEffect, useRef } from "react";

// ISO country codes (used by flagcdn.com)
const COUNTRY_OPTIONS = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "es", name: "Spain" },
  { code: "br", name: "Brazil" },
];

export default function SearchBar({ searchQuery, setSearchQuery, country, setCountry, onSearch }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(COUNTRY_OPTIONS[0]);
  const dropdownRef = useRef(null);

  // Sync selected country with global state
  useEffect(() => {
    const match = COUNTRY_OPTIONS.find((c) => c.code === country);
    if (match) setSelected(match);
  }, [country]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (code) => {
    const match = COUNTRY_OPTIONS.find((c) => c.code === code);
    if (match) {
      setSelected(match);
      setCountry(code);
      setOpen(false);
    }
  };

  // Handle Enter key for search
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) onSearch();
  };

  return (
    <div
      className="flex flex-col sm:flex-row justify-center items-stretch w-full sm:w-auto gap-2 sm:gap-0"
      ref={dropdownRef}
    >
      {/* Search Input */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a show..."
        className="w-full sm:w-80 px-4 py-2 bg-gray-800 border border-gray-700 text-white
                   rounded-md sm:rounded-l-md sm:rounded-r-none 
                   focus:outline-none focus:ring-2 focus:ring-blue-600 
                   transition-all h-11"
      />

      {/* Country Selector */}
      <div className="relative sm:h-11">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-center gap-2 h-full w-full sm:w-auto px-4 
                     bg-gray-800 text-white border border-gray-700 
                     hover:bg-gray-700 transition rounded-md sm:rounded-none sm:rounded-r-none"
          style={{ borderLeft: "1px solid #4b5563" }}
          aria-expanded={open}
          aria-label="Select country"
        >
          <img
            src={`https://flagcdn.com/w80/${selected.code}.png`}
            alt={selected.name}
            className="w-5 h-5 rounded-full object-cover"
          />
          <svg
            className={`w-4 h-4 ml-1 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <ul
            className="absolute right-0 mt-1 w-44 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {COUNTRY_OPTIONS.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-800 ${
                    option.code === selected.code ? "bg-gray-800" : ""
                  }`}
                  role="option"
                  aria-selected={option.code === selected.code}
                >
                  <img
                    src={`https://flagcdn.com/w40/${option.code}.png`}
                    alt={option.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-200">{option.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={onSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-semibold
                   rounded-md sm:rounded-l-none sm:rounded-r-md 
                   transition-all h-11"
      >
        Search
      </button>
    </div>
  );
}