import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useCountry } from "../context/CountryContext";

export default function Navbar({ searchQuery, setSearchQuery, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { country, setCountry } = useCountry();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "New", path: "/new" },
    { name: "Popular", path: "/popular" },
  ];

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-bold text-blue-500 hover:text-blue-400 transition"
        >
          StreamScope
        </Link>

        {/* Search (Desktop Only) */}
        <div className="hidden lg:flex flex-1 justify-center px-6">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            country={country}
            setCountry={setCountry}
            onSearch={onSearch}
          />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(({ name, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                className={`text-gray-300 hover:text-blue-400 transition ${
                  active ? "text-blue-400 font-semibold" : ""
                }`}
              >
                {name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="md:hidden text-gray-300 hover:text-blue-400 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 px-6 py-4 bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            {navItems.map(({ name, path }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={name}
                  to={path}
                  onClick={closeMenu}
                  className={`block text-gray-300 hover:text-blue-400 transition ${
                    active ? "text-blue-400 font-semibold" : ""
                  }`}
                >
                  {name}
                </Link>
              );
            })}

            {/* Search in Mobile Menu */}
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