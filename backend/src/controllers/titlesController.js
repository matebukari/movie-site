// src/controllers/titlesController.js
import { fetchShowsByCountry } from "../services/watchmodeService.js";

export const getShowsByCountry = async (req, res) => {
  try {
    const { country, limit } = req.query;

    if (!country) {
      return res.status(400).json({ error: "Country is required (e.g. ?country=us)" });
    }

    const topLimit = limit ? parseInt(limit) : 10;

    const shows = await fetchShowsByCountry(country, topLimit);

    res.json({
      country,
      count: shows.length,
      results: shows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching shows" });
  }
};
