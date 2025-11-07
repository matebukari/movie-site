// src/services/api/tmdb.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const fetchTMDBDetails = async ({ tmdb_id, title, type = "movie" }) => {
  try {
    const tmdbType = type === "tv_series" ? "tv" : "movie";
    let data = null;

    // 1️⃣ Try by TMDB ID first
    if (tmdb_id) {
      try {
        const res = await axios.get(`${TMDB_BASE_URL}/${tmdbType}/${tmdb_id}`, {
          params: {
            api_key: TMDB_API_KEY,
            append_to_response: "videos",
            language: "en-US",
          },
        });
        data = res.data;
      } catch (err) {
        if (err.response?.status === 404) {
          console.warn(`⚠️ TMDB ID ${tmdb_id} not found, falling back to title search for "${title}"`);
        } else {
          throw err;
        }
      }
    }

    // 2️⃣ If ID fetch failed, search by title
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
      } else {
        console.warn(`⚠️ No TMDB match found for title "${title}"`);
      }
    }

    if (!data) return null;

    // 🎬 Extract trailer (YouTube)
    const youtubeTrailer = data.videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    const trailerUrl = youtubeTrailer
      ? `https://www.youtube.com/watch?v=${youtubeTrailer.key}`
      : null;

    // ✅ Return normalized data (including runtime for both TV and movies)
    return {
      id: data.id,
      title: data.title || data.name,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      genres: data.genres || [],
      vote_average: data.vote_average || null,
      release_date: data.release_date || data.first_air_date || null,
      trailer: trailerUrl,
      runtime: data.runtime ?? null,
      episode_run_time: Array.isArray(data.episode_run_time)
        ? data.episode_run_time
        : data.episode_run_time
        ? [data.episode_run_time]
        : [],
    };
  } catch (err) {
    console.warn(`⚠️ TMDB fetch failed for "${title || tmdb_id}": ${err.message}`);
    return null;
  }
};
