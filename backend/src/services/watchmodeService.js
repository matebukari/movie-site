import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = `https://api.watchmode.com/v1`;

const cache = new Map();

/**
 * Fetch list of shows available in a given country
 */
export const fetchShowsByCountry = async (country, limit = 15, page = 1) => {
  const cacheKey = `${country}-${limit}-${page}`

  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    const response = await axios.get(`${BASE_URL}/list-titles/`,{
      params: {
        apiKey: WATCHMODE_API_KEY,
        regions: country.toUpperCase(),
        limit,
        page,
      },
    });

    const shows = response.data.titles || [];

    const detailedShows = await Promise.all(
      shows.map(async (show) => {
        try {
          const detailRes = await axios.get(`${BASE_URL}/title/${show.id}/details/`, {
            params: { apiKey: WATCHMODE_API_KEY },
          });

          const details = detailRes.data || {};
          return {
            id: show.id,
            title: show.title,
            type: show.type,
            year: show.year,
            backdrop: details.backdrop || null,
            poster: details.poster || null,
            image: details.backdrop || details.poster || null,
            trailer: details.trailer || null,

          };
        } catch {
          // if a single call fails, continue gracefully
          return {
            id: show.id,
            title: show.title,
            type: show.type,
            year: show.year,
            backdrop: null,
            poster: null,
            image: null,
          };
        }
      })
    )

    cache.set(cacheKey, detailedShows);
    setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);
    return detailedShows;
  } catch (error) {
    console.error("Error fetching Watchmode data:", error.response?.data || error.message);
    throw new Error("Failed to fetch shows from Watchmode API");
  }
};

export const fetchShowsBySearch = async (query, country = "us", page = 1) => {
  const cacheKey = `search-${query}-${country}-${page}`;
  if (cache.has(cacheKey)) {
    console.log(`Serving cached search results for "${query}" [${country}, page ${page}]`);
    return cache.get(cacheKey);
  }

  try {
    const doSearch = async (searchValue, fuzzy = false) => {
      const response = await axios.get(`${BASE_URL}/search/`, {
        params: {
          apiKey: WATCHMODE_API_KEY,
          search_field: "name",
          search_value: searchValue,
          fuzzy_search: fuzzy,
          page,
          limit: 12,
          regions: country.toUpperCase(),
        },
      });
      return response.data?.title_results || [];
    };

    // 🔹 Step 1: Try fuzzy search first
    let shows = await doSearch(query, true);

    // 🔹 Step 2: If no fuzzy match, try partial match
    if (shows.length === 0 && query.includes(" ")) {
      console.log(`No fuzzy results for "${query}", trying partial match...`);
      const partialQuery = query.split(" ")[0]; // use first word
      shows = await doSearch(partialQuery, true);
    }

    if (!shows || shows.length === 0) {
      console.log(`❌ No results found for "${query}".`);
      return [];
    }

    // 🔹 Step 3: Fetch show details
    const detailedShows = await Promise.all(
      shows.map(async (show) => {
        try {
          const detailRes = await axios.get(`${BASE_URL}/title/${show.id}/details/`, {
            params: { apiKey: WATCHMODE_API_KEY },
          });

          const details = detailRes.data || {};
          return {
            id: show.id,
            title: show.name || details.title,
            type: show.type,
            year: show.year,
            poster: details.poster || show.image_url || null,
            backdrop: details.backdrop || null,
            trailer: details.trailer || null,
          };
        } catch (err) {
          console.warn(`⚠️ Failed to fetch details for ${show.id}:`, err.message);
          return {
            id: show.id,
            title: show.name,
            type: show.type,
            year: show.year,
            poster: show.image_url || null,
            backdrop: null,
            trailer: null,
          };
        }
      })
    );

    cache.set(cacheKey, detailedShows);
    setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000);

    return detailedShows;
  } catch (error) {
    console.error("🔥 Error searching Watchmode:", error.response?.data || error.message);
    throw new Error("Failed to search shows from Watchmode API");
  }
};



/**
* Fetch streaming platforms for a specific show
*/
export const fetchShowSources = async (showId, country) => {
  const cacheKey = `sources-${showId}-${country}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    const response = await axios.get(`${BASE_URL}/title/${showId}/sources/`, {
      params: {
        apiKey: WATCHMODE_API_KEY,
        regions: country.toUpperCase(),
      },
    });

    const sources = response.data || [];
    const uniquePlatforms = [...new Set(sources.map((s) => s.name))];

    cache.set(cacheKey, uniquePlatforms);
    setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000);
    return uniquePlatforms;
    
  } catch (error) {
    console.error("Error fetching show sources:", error.response?.data || error.message);
    throw new Error("Failed to fetch sources from Watchmode API");
  }
};
