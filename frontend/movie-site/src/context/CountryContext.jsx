import { createContext, useContext, useState, useEffect } from "react";

const CountryContext = createContext();

export const CountryProvider = ({ children }) => {
  const [country, setCountry] = useState("us");
  const [countryDetected, setCountryDetected] = useState(false);

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/utils/detect-country`);
        const data = await res.json();

        if (data?.country) {
          setCountry(data.country);
          localStorage.setItem("country", data.country);
        } else {
          const saved = localStorage.getItem("country");
          setCountry(saved || "us");
        }
      } catch {
        const saved = localStorage.getItem("country");
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
