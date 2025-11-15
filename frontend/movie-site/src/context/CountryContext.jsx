import { createContext, useContext, useState, useEffect } from "react";

const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [country, setCountry] = useState("us");
  const [countryDetected, setCountryDetected] = useState(false);

  const SUPPORTED_COUNTRIES = ["us", "gb", "ca", "au", "in", "es", "br"];

  useEffect(() => {
    const detectCountry = async () => {
      // First try to load from localStorage
      const saved = localStorage.getItem("country");
      if (saved && SUPPORTED_COUNTRIES.includes(saved)) {
        setCountry(saved);
        setCountryDetected(true);
        return;
      }

      try {
        // Detect via frontend IP lookup
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();

        let detected = data.country_code?.toLowerCase() || "us";

        // Fallback if unsupported
        if (!SUPPORTED_COUNTRIES.includes(detected)) {
          detected = "us";
        }

        setCountry(detected);
        localStorage.setItem("country", detected);
      } catch (err) {
        console.error("Country detection failed:", err);
        setCountry(saved || "us");
      } finally {
        setCountryDetected(true);
      }
    };

    detectCountry();
  }, []);

  return (
    <CountryContext.Provider value={{ country, setCountry, countryDetected }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => useContext(CountryContext);
