import React from "react";

const countries = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "de", name: "Germany" },
  { code: "jp", name: "Japan" },
  { code: "fr", name: "France" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
];

function CountryDropdown({ country, setCountry }) {
  return (
    <div>
      <label
        htmlFor="country"
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        Country
      </label>
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