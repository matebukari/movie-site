import { useState } from "react";
import { Menu, X } from "lucide-react";
import SearchBar from "./SearchBar";

function Navbar({ searchQuery, setSearchQuery, country, setCountry, onSearch }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "New", href: "/new" },
    { name: "Popular", href: "/popular" },
  ];

  return(
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 sticky top-0 z-50 shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-blue-500">🎬 StreamScope</div>
        <div className="hidden lg:flex flex-1 justify-center px-6">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            country={country}
            setCountry={setCountry}
            onSearch={onSearch}
          />
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href={item.href}
              className="text-gray-300 hover:text-blue-400 transition"
            >
              {item.name}
            </a>
          ))}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-300 hover:text-blue-400"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-4 text-center border-t border-gray-800 pt-4">
          {navItems.map((item) => (
            <a
              key={item.name} 
              href={item.href}
              className="block text-gray-300 hover:text-blue-400 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
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