import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = `https://api.watchmode.com/v1`;

export const fetchShowsByCountry = async (country) => {
  
  try {
    const response = await axios.get(`${BASE_URL}/list-titles/`,{
      params: {
        apiKey: WATCHMODE_API_KEY,
        regions: country.toUpperCase(),
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

    detailedShows.forEach((show, index) => {
      console.log(`${index + 1}. ${show.title} (${show.year})`);
      show.platforms.forEach((p) => console.log(`   - ${p}`));
    });

    return detailedShows;

    
  } catch (error) {
    console.error("Error fetching Watchmode data:", error.response?.data || error.message);
    throw new Error("Failed to fetch shows from Watchmode API");
  }
  
};