// src/controllers/titlesController.js
import { fetchShowsByCountry } from "../services/streamingAvailabilityService.js";

export const getShowsByCountry = async (req, res) => {
  try {
    const { country } = req.query;

    if (!country) {
      return res.status(400).json({ error: "Country is required (e.g. ?country=us)" });
    }

    const shows = await fetchShowsByCountry(country);

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
