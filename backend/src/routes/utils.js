import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/detect-country", async (req, res) => {
  try {
    const response = await fetch("https://ipwho.is/");
    const data = await response.json();
    res.json({ country: data.country_code?.toLowerCase() || "us" });
  } catch (err) {
    console.error("Error detecting user location:", err.message);
    res.json({ country: "us" });
  }
});

export default router;