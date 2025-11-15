import {
  fetchShowsByCountry,
  fetchShowsBySearch,
  fetchShowSources,
  fetchNewReleases,
  fetchPopularShows,
} from "../services/index.js"; 

// Search shows by title
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

// Get shows available in a country
export const getShowsByCountry = async (req, res) => {
  try {
    const { country, limit, page } = req.query;

    if (!country) {
      return res.status(400).json({ error: "Country is required (e.g. ?country=us)" });
    }

    const topLimit = limit ? parseInt(limit, 10) : 10;
    const currentPage = page ? parseInt(page) : 1;

    const shows = await fetchShowsByCountry(country, topLimit, currentPage);

    if (!Array.isArray(shows)) {
      console.error("❌ fetchShowsByCountry returned invalid:", shows);
      return res.status(500).json({ error: "Internal data format error" });
    }

    res.json({
      country,
      page: currentPage,
      limit: topLimit,
      count: shows.length,
      results: shows,
    });
  } catch (error) {
    console.error("❌ Error in getShowsByCountry:", {
      message: error.message,
      stack: error.stack,
      details: error.response?.data || error,
    });
    res.status(500).json({ error: "Server error fetching shows" });
  }
};

// Get available streaming platforms for a show
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

// Get newly released titles
export const getNewTitles = async (req, res) => {
  try {
    const { country = "us", limit = 15, page = 1 } = req.query;

    const newReleases = await fetchNewReleases(country, limit, page);

    if (!Array.isArray(newReleases)) {
      console.error("⚠️ fetchNewReleases returned invalid:", newReleases);
      return res.status(500).json({ error: "Internal data format error" });
    }

    res.json({
      country,
      limit,
      page,
      count: newReleases.length,
      results: newReleases,
    });
  } catch (error) {
    console.error("❌ Error in getNewTitles:", error.message);
    res.status(500).json({ error: "Server error fetching new releases" });
  }
};

// Get popular shows (based on Watchmode + TMDB)
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
