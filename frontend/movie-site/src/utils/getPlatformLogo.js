// src/utils/getPlatformLogo.js

// 🧩 Map multiple aliases → single normalized logo name
const LOGO_MAP = {
  netflix: "netflix",
  "disney+": "disneyplus",
  "disney plus": "disneyplus",
  "prime video": "primevideo",
  "amazon prime": "primevideo",
  amazon: "primevideo",
  "apple tv": "appletv",
  "apple tv+": "appletvplus",
  hulu: "hulu",
  max: "max",
  "hbo max": "max",
  peacock: "peacock",
  "paramount+": "paramountplus",
  "paramount plus": "paramountplus",
  youtube: "youtube",
  "rakuten tv": "rakutentv",
  "sky store": "skystore",
  now: "nowtv",
  "now tv": "nowtv",
  crave: "crave",
  "bbc iplayer": "bbciplayer",
  chili: "chili",
  starz: "starz",
};

/**
 * ✅ Returns the URL to a platform logo from /public/logos/
 * Falls back to /logos/default.svg if missing
 */
export function getPlatformLogo(name) {
  if (!name) return "/logos/default.svg";
  const key =
    LOGO_MAP[name.toLowerCase()] ||
    name.toLowerCase().replace(/\s+/g, "");
  return `/logos/${key}.svg`;
}

/**
 * 🧹 Normalizes platform names and removes duplicates
 * Keeps consistent casing for display + logo match
 */
export function normalizePlatforms(list = []) {
  const seen = new Set();
  return list
    .map((name) => name?.trim().toLowerCase())
    .map((name) => {
      switch (name) {
        case "amazon":
        case "amazon prime":
        case "prime video":
          return "Prime Video";
        case "apple tv":
        case "apple tv+":
          return "Apple TV+";
        case "disney+":
        case "disney plus":
          return "Disney+";
        case "hbo max":
        case "max":
          return "Max";
        case "paramount+":
        case "paramount plus":
          return "Paramount+";
        case "now":
        case "now tv":
          return "Now TV";
        case "bbc iplayer":
          return "BBC iPlayer";
        case "rakuten tv":
          return "Rakuten TV";
        case "sky store":
          return "Sky Store";
        case "chili":
          return "CHILI";
        default:
          return capitalizeWords(name);
      }
    })
    .filter((name) => {
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    });
}

/** 🪄 Capitalize words for clean display */
function capitalizeWords(str = "") {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
