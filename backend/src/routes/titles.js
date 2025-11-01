// src/routes/titles.js
import express from "express";
import { getShowsByCountry, getShowSources, getShowsBySearch } from "../controllers/titlesController.js";

const router = express.Router();

// GET /api/titles/by-country?country=us
router.get("/by-country", getShowsByCountry);

router.get("/search", getShowsBySearch);

// GET /api/titles/:id/sources?country=us
router.get("/:id/sources", getShowSources);

export default router;
