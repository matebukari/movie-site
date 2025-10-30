// src/routes/titles.js
import express from "express";
import { getShowsByCountry } from "../controllers/titlesController.js";

const router = express.Router();

// GET /api/titles/by-country?country=us&services=netflix,prime&type=movie
router.get("/by-country", getShowsByCountry);

export default router;
