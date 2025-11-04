// src/routes/titles.js
import express from "express";
import { getShowsByCountry, getShowSources, getShowsBySearch, getNewTitles, getPopularTitles } from "../controllers/titlesController.js";

const router = express.Router();

// GET /api/titles/by-country?country=us
router.get("/by-country", getShowsByCountry);

router.get("/search", getShowsBySearch);

router.get("/new", getNewTitles);

router.get("/popular", getPopularTitles);


// GET /api/titles/:id/sources?country=us
router.get("/:id/sources", getShowSources);

export default router;
