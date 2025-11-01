import React from "react";

const countries = [
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "gb", name: "United Kingdom" },
  { code: "in", name: "India" },
  { code: "es", name: "Spain" },
  { code: "br", name: "Brazil" },
];

function CountryDropdown({ country, setCountry }) {
  return (
    <div>
      <select
        id="country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="border border-gray-700 bg-gray-800 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CountryDropdown;