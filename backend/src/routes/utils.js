import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const SUPPORTED_COUNTRIES = [
  "us", "gb", "ca", "au", "in", "es", "br"
];

router.get("/detect-country", async (req, res) => {
  try {
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      null;

    // Remove IPv6 prefix "::ffff:"
    if (ip?.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }

    // Localhost fallback (during local dev)
    if (!ip || ip === "127.0.0.1" || ip === "::1") {
      return res.json({ country: "us" });
    }

    // Query IP lookup
    const response = await fetch(`https://ipwho.is/${ip}`);
    const data = await response.json();

    let detected = data.country_code?.toLowerCase();

    if (!detected || !SUPPORTED_COUNTRIES.includes(detected)) {
      detected = "us";
    }

    res.json({ country: detected });

  } catch (err) {
    console.error("IP detection error:", err.message);
    res.json({ country: "us" });
  }
});

export default router;
