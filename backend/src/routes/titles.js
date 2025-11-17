import express from "express";
import { 
  getShowsByCountry,
  getShowSources,
  getShowsBySearch,
  getNewTitles,
  getPopularTitles,
  getShowDetails 
} from "../controllers/titlesController.js";

const router = express.Router();

router.get("/by-country", getShowsByCountry);

router.get("/search", getShowsBySearch);

router.get("/new", getNewTitles);

router.get("/popular", getPopularTitles);

router.get("/:id", getShowDetails);

router.get("/:id/sources", getShowSources);

export default router;
