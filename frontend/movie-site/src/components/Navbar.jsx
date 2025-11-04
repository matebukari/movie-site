import { useState } from "react";
import { Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";
import { useCountry } from "../context/CountryContext"; // ✅ Import global context
import { Link, useLocation } from "react-router-dom"; // ✅ Better navigation without reloads

function Navbar({ searchQuery, setSearchQuery, onSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { country, setCountry } = useCountry(); // ✅ Shared across all pages
  const location = useLocation();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "New", href: "/new" },
    { name: "Popular", href: "/popular" },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* 🔹 Brand Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-500">
          🎬 StreamScope
        </Link>

        {/* 🔍 Center Search (desktop) */}
        <div className="hidden lg:flex flex-1 justify-center px-6">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            country={country}
            setCountry={setCountry}
            onSearch={onSearch}
          />
        </div>

        {/* 🧭 Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-gray-300 hover:text-blue-400 transition ${
                location.pathname === item.href ? "text-blue-400 font-semibold" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* ☰ Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-300 hover:text-blue-400"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📱 Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 text-center border-t border-gray-800 pt-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block text-gray-300 hover:text-blue-400 transition ${
                location.pathname === item.href ? "text-blue-400 font-semibold" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex justify-center">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              country={country}
              setCountry={setCountry}
              onSearch={onSearch}
            />
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
