import { useState, useEffect, useRef } from "react";

const countryOptions = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "fr", name: "France" },
  { code: "de", name: "Germany" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "in", name: "India" },
];

function SearchBar({ searchQuery, setSearchQuery, country, setCountry, onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const match = countryOptions.find((c) => c.code === country);
    if (match) setSelectedCountry(match);
  }, [country]);

  const handleSelect = (code) => {
    setCountry(code);
    const match = countryOptions.find((c) => c.code === code);
    if (match) setSelectedCountry(match); 
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-center items-stretch w-full sm:w-auto gap-2 sm:gap-0">
      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search for a show..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full sm:w-80 px-4 py-2 bg-gray-800 border border-gray-700 text-white
                   rounded-md sm:rounded-l-md sm:rounded-r-none 
                   focus:outline-none focus:ring-2 focus:ring-blue-600 
                   transition-all h-11"
      />

      {/* 🌍 Country Dropdown */}
      <div className="relative sm:h-11" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center justify-center gap-2 h-full w-full sm:w-auto px-4 
                     bg-gray-800 text-white border border-gray-700 
                     hover:bg-gray-700 transition
                     rounded-md sm:rounded-none sm:rounded-r-none"
          style={{ borderLeft: "1px solid #4b5563" }}
        >
          <img
            src={`https://flagcdn.com/w80/${selectedCountry.code}.png`}
            alt={selectedCountry.name}
            className="w-5 h-5 rounded-full object-cover"
          />
          <svg
            className={`w-4 h-4 ml-1 transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
            {countryOptions.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c.code)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-800 ${
                  c.code === country ? "bg-gray-800" : ""
                }`}
              >
                <img
                  src={`https://flagcdn.com/w40/${c.code}.png`}
                  alt={c.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-sm text-gray-200">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 🔘 Search Button */}
      <button
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

export default SearchBar;