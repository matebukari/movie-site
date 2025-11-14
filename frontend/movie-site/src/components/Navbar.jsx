import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useCountry } from "../context/CountryContext";
import CountrySelector from "./CountrySelector";
import logo from "../../assets/logo.svg";

export default function Navbar({ searchQuery, setSearchQuery, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Internal fallback state for New & Popular pages
  const [internalQuery, setInternalQuery] = useState("");

  // If parent does not pass props -> use internal ones
  const query = searchQuery ?? internalQuery;
  const updateQuery = setSearchQuery ?? setInternalQuery;

  const { country, setCountry } = useCountry();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "New", path: "/new" },
    { name: "Popular", path: "/popular" },
  ];

  const toggleMenu = () => setMenuOpen((p) => !p);
  const closeMenu = () => setMenuOpen(false);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      className="
        sticky top-4 z-50
        w-[98%] mx-auto
        rounded-2xl
        border border-gray-700/40
        bg-gray-900/60 
        backdrop-blur-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.45)]
        ring-1 ring-gray-800/60
      "
    >
      {/* TOP BAR */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        
        {/* LOGO */}
        <Link
          to="/"
          onClick={() => {
            closeMenu();
            scrollTop();
          }}
          className="flex items-center min-w-0"
        >
          <img
            src={logo}
            alt="StreamScope logo"
            className="
              h-12 w-auto object-contain contrast-125
              origin-left transition-transform duration-300
              scale-[2.5] sm:scale-[2.8] md:scale-[3.3] lg:scale-[3.6] xl:scale-[4]
              hover:drop-shadow-[0_0_12px_#ef4444]
              -ml-1.5 sm:-ml-3 md:-ml-5 lg:-ml-7 xl:-ml-9
            "
            style={{ transformOrigin: 'left center' }}
          />
        </Link>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 justify-center px-8">
          <SearchBar
            searchQuery={query}
            setSearchQuery={updateQuery}
            country={country}
            setCountry={setCountry}
            onSearch={onSearch}
          />
        </div>

        {/* Country Selector (desktop only) */}
        <div className="hidden md:flex lg:block md:ml-4">
          <CountrySelector country={country} setCountry={setCountry} />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 ml-6">
          {navItems.map(({ name, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={name}
                to={path}
                onClick={() => scrollTop()}
                className={`
                  px-2 py-1 transition rounded-md
                  ${
                    active
                      ? "text-red-400 font-semibold drop-shadow-[0_0_8px_#ef4444]"
                      : "text-gray-300 hover:text-red-400 hover:drop-shadow-[0_0_8px_#ef4444]"
                  }
                `}
              >
                {name}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="md:hidden text-gray-300 hover:text-red-400 transition"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Search */}
      <div className="block lg:hidden px-4 pb-3">
        <SearchBar
          searchQuery={query}
          setSearchQuery={updateQuery}
          country={country}
          setCountry={setCountry}
          onSearch={onSearch}
        />
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900/95 backdrop-blur-xl px-6 py-5 relative animate-slide-down">

          {/* Country Selector inside mobile menu */}
          <div className="relative z-50 pb-4 mb-4 border-b border-gray-700">
            <div className="w-full bg-gray-800/70 border border-gray-700 rounded-xl p-4 shadow-lg backdrop-blur text-center">
              <p className="text-gray-300 mb-2 text-sm tracking-wide">
                Change Country
              </p>
              <div className="flex justify-center">
                <CountrySelector country={country} setCountry={setCountry} />
              </div>
            </div>
          </div>

          {/* Mobile Links */}
          <div className="relative z-10 flex flex-col items-center gap-5 pt-3">
            {navItems.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={() => closeMenu()}
                className="text-lg text-gray-300 hover:text-red-400 transition"
              >
                {name}
              </Link>
            ))}
          </div>

        </div>
      )}
    </nav>
  );
}
