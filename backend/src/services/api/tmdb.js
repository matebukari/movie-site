// src/services/api/tmdb.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetch detailed info from TMDB (poster, backdrop, trailer, etc.)
 * @param {Object} options
 * @param {number|string} options.tmdb_id - TMDB ID (if known)
 * @param {string} options.title - Title of the movie/show
 * @param {string} options.type - "movie" or "tv_series"
 */
export const fetchTMDBDetails = async ({ tmdb_id, title, type = "movie" }) => {
  try {
    const tmdbType = type === "tv_series" ? "tv" : "movie";
    let data = null;

    // 1️⃣ Try fetching directly by TMDB ID
    if (tmdb_id) {
      const res = await axios.get(`${TMDB_BASE_URL}/${tmdbType}/${tmdb_id}`, {
        params: {
          api_key: TMDB_API_KEY,
          append_to_response: "videos",
          language: "en-US",
        },
      });
      data = res.data;
    }

    // 2️⃣ If no TMDB ID, search by title
    if (!data && title) {
      const searchRes = await axios.get(`${TMDB_BASE_URL}/search/${tmdbType}`, {
        params: {
          api_key: TMDB_API_KEY,
          query: title,
          include_adult: false,
          language: "en-US",
        },
      });

      const result = searchRes.data.results?.[0];
      if (result?.id) {
        const fullRes = await axios.get(`${TMDB_BASE_URL}/${tmdbType}/${result.id}`, {
          params: {
            api_key: TMDB_API_KEY,
            append_to_response: "videos",
            language: "en-US",
          },
        });
        data = fullRes.data;
      }
    }

    if (!data) return null;

    // 3️⃣ Extract trailer (YouTube)
    const youtubeTrailer = data.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    const trailerUrl = youtubeTrailer
      ? `https://www.youtube.com/watch?v=${youtubeTrailer.key}`
      : null;

    // 4️⃣ Return normalized TMDB data
    return {
      poster: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      backdrop: data.backdrop_path
        ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
        : null,
      overview: data.overview,
      genres: data.genres || [],
      rating: data.vote_average || null,
      release_date: data.release_date || data.first_air_date || null,
      trailer: trailerUrl, // ✅ this is key!
    };
  } catch (err) {
    console.warn(`⚠️ TMDB fetch failed for "${title || tmdb_id}": ${err.message}`);
    return null;
  }
};
