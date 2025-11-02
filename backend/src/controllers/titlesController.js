// src/controllers/titlesController.js
import {
  fetchShowsByCountry,
  fetchShowsBySearch,
  fetchShowSources,
  fetchNewReleases,
  fetchPopularShows,
} from "../services/index.js"; // ✅ now imports from your new modular service entry

// 🔍 Search shows by title
export const getShowsBySearch = async (req, res) => {
  try {
    const { query, country = "us", page = 1 } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required (e.g. ?query=avatar)" });
    }

    const shows = await fetchShowsBySearch(query, country, Number(page));

    res.json({
      query,
      country,
      count: shows.length,
      results: shows,
    });
  } catch (error) {
    console.error("❌ Error in getShowsBySearch:", error.message);
    res.status(500).json({ error: "Server error fetching search results" });
  }
};

// 🌍 Get shows available in a country
export const getShowsByCountry = async (req, res) => {
  try {
    const { country = "us", limit = 10, page = 1 } = req.query;
    const shows = await fetchShowsByCountry(country, Number(limit), Number(page));

    res.json({
      country,
      page: Number(page),
      limit: Number(limit),
      count: shows.length,
      results: shows,
    });
  } catch (error) {
    console.error("❌ Error in getShowsByCountry:", error.message);
    res.status(500).json({ error: "Server error fetching shows" });
  }
};

// 🎬 Get available streaming platforms for a show
export const getShowSources = async (req, res) => {
  try {
    const { id } = req.params;
    const { country = "us" } = req.query;

    if (!id) return res.status(400).json({ error: "Show ID is required" });

    const platforms = await fetchShowSources(id, country);
    res.json({ id, country, platforms });
  } catch (error) {
    console.error("❌ Error in getShowSources:", error.message);
    res.status(500).json({ error: "Server error fetching show sources" });
  }
};

// 🆕 Get newly released titles
export const getNewTitles = async (req, res) => {
  try {
    const { country = "us", limit = 15, page = 1 } = req.query;
    const newReleases = await fetchNewReleases(country, Number(limit), Number(page));

    res.json({
      country,
      limit: Number(limit),
      page: Number(page),
      count: newReleases.length,
      results: newReleases,
    });
  } catch (error) {
    console.error("❌ Error in getNewTitles:", error.message);
    res.status(500).json({ error: "Server error fetching new releases" });
  }
};

// 🔥 Get popular shows (based on Watchmode + TMDB)
export const getPopularTitles = async (req, res) => {
  try {
    const { country = "us", limit = 15, page = 1 } = req.query;
    const popularShows = await fetchPopularShows(country, Number(limit), Number(page));

    res.json({
      country,
      limit: Number(limit),
      page: Number(page),
      count: popularShows.length,
      results: popularShows,
    });
  } catch (error) {
    console.error("❌ Error in getPopularTitles:", error.message);
    res.status(500).json({ error: "Server error fetching popular shows" });
  }
};
