// src/controllers/titlesController.js
import { fetchShowsByCountry, fetchShowsBySearch, fetchShowSources } from "../services/watchmodeService.js";

export const getShowsBySearch = async (req, res) => {
  try {
    const { query, country, page } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required (e.g. ?query=avatar)"});
    }

    const shows = await fetchShowsBySearch(query, country, page);
    res.json({ query, count: shows.length, results: shows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching search results" });
  }
}

export const getShowsByCountry = async (req, res) => {
  try {
    const { country, limit, page } = req.query;

    if (!country) {
      return res.status(400).json({ error: "Country is required (e.g. ?country=us)" });
    }

    const topLimit = limit ? parseInt(limit, 10) : 10;
    const currentPage = page ? parseInt(page) : 1;

    const shows = await fetchShowsByCountry(country, topLimit, currentPage);

    res.json({
      country,
      page: currentPage,
      limit: topLimit,
      count: shows.length,
      results: shows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching shows" });
  }
};

export const getShowSources = async (req, res) => {
  try {
    const { id } = req.params;
    const { country } = req.query;
    if(!country)return res.status(400).json({ error: "Country is required" });

    const platforms = await fetchShowSources(id, country);
    res.json({ id, country, platforms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching show sources" })
  }
};
