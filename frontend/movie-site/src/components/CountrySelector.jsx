import { useState, useEffect, useRef } from "react";

const countryOptions = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "es", name: "Spain" },
  { code: "br", name: "Brazil" },
];

export default function CountrySelector({ country, setCountry, onCountryChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryOptions[0]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const match = countryOptions.find((c) => c.code === country);
    if (match) setSelectedCountry(match);
  }, [country]);

  const handleSelect = (code) => {
    setCountry(code);
    onCountryChange?.(code);
    const match = countryOptions.find((c) => c.code === code);
    if (match) setSelectedCountry(match);
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative sm:h-11" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center gap-2 h-full w-full sm:w-auto px-4 
                   bg-gray-800 text-white border border-gray-700 
                   hover:bg-gray-700 transition rounded-md sm:rounded-none sm:rounded-r-md"
      >
        <img
          src={`https://flagcdn.com/w80/${selectedCountry.code}.png`}
          alt={selectedCountry.name}
          className="w-5 h-5 rounded-full object-cover"
        />
        <svg
          className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

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
  );
}
