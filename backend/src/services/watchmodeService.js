import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = `https://api.watchmode.com/v1`;

const cache = new Map();

export const fetchShowsByCountry = async (country, limit = 10) => {
  const cacheKey = `${country}-${limit}`

  if (cache.has(cacheKey)) {
    console.log(`Serving cached data for ${country}`);
    return cache.get(cacheKey);
  }
  
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
        const sourcesResponse = await axios.get(`${BASE_URL}/title/${show.id}/sources/`, {
          params: {
            apiKey: WATCHMODE_API_KEY,
            regions: country.toUpperCase(),
          },
        });

        const sources = sourcesResponse.data || [];

        const uniquePlatforms = [
          ...new Set(sources.map((s) => s.name))
        ];

        return {
          id: show.id,
          title: show.title,
          type: show.type,
          year: show.year,
          platforms: uniquePlatforms
          
        };
      })
    );

    cache.set(cacheKey, detailedShows);

    // (Optional) 4. Expire cache after 5 minutes
    setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000);


    return detailedShows;

    
  } catch (error) {
    console.error("Error fetching Watchmode data:", error.response?.data || error.message);
    throw new Error("Failed to fetch shows from Watchmode API");
  }
  
};