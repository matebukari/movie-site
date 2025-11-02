import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const fetchTMDBDetails = async ({ tmdb_id, title, type = "movie" }) => {
  const tmdbType = type === "tv_series" ? "tv" : "movie";
  try {
    if (tmdb_id) {
      const { data } = await axios.get(`${TMDB_BASE_URL}/${tmdbType}/${tmdb_id}`, {
        params: { api_key: TMDB_API_KEY, language: "en-US" },
      });
      return data;
    }

    if (title) {
      const { data } = await axios.get(`${TMDB_BASE_URL}/search/${tmdbType}`, {
        params: { api_key: TMDB_API_KEY, query: title, include_adult: false },
      });
      return data.results?.[0] || null;
    }

    return null;
  } catch (err) {
    console.warn(`⚠️ TMDB failed for "${title || tmdb_id}": ${err.message}`);
    return null;
  }
};
