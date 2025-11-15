import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const SUPPORTED_COUNTRIES = ["us", "gb", "ca", "au", "in", "es", "br"];

// Netlify / Vercel IP sources
function extractIP(req) {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    null;

  if (!ip) return null;

  // Remove IPv6 prefix ::ffff:
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // Localhost → do NOT lookup
  if (ip === "127.0.0.1" || ip === "::1") return null;

  return ip;
}

router.get("/detect-country", async (req, res) => {
  try {
    const ip = extractIP(req);

    if (!ip) {
      // Local dev or fallback
      return res.json({ country: "us" });
    }

    console.log("📡 Detected visitor IP:", ip);

    // Query remote IP whois API
    const lookup = await fetch(`https://ipwho.is/${ip}`);
    const data = await lookup.json();

    let detected = data.country_code?.toLowerCase();

    // Fallback if unknown or unsupported
    if (!detected || !SUPPORTED_COUNTRIES.includes(detected)) {
      detected = "us";
    }

    res.json({ country: detected });

  } catch (err) {
    console.error("❌ Country detection error:", err);
    res.json({ country: "us" });
  }
});

export default router;
