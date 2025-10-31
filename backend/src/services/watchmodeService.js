import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = `https://api.watchmode.com/v1`;

const cache = new Map();

/**
 * Fetch list of shows available in a given country
 */
export const fetchShowsByCountry = async (country, limit = 10) => {
  const cacheKey = `${country}-${limit}`

  if (cache.has(cacheKey)) return cache.get(cacheKey);
  
  try {
    const response = await axios.get(`${BASE_URL}/list-titles/`,{
      params: {
        apiKey: WATCHMODE_API_KEY,
        regions: country.toUpperCase(),
        limit,
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
