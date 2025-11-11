// src/utils/getPlatformLogo.js

const LOGO_MAP = {
  netflix: "netflix",
  "disney+": "disneyplus",
  "disney plus": "disneyplus",
  "prime video": "primevideo",
  "amazon prime": "primevideo",
  amazon: "primevideo",
  "apple tv": "appletv",
  "apple tv app": "appletv",
  "apple tv+": "appletvplus",
  "apple tv plus": "appletvplus",
  "appletv+": "appletvplus",
  appletvplus: "appletvplus",
  appletv: "appletv",
  "apple tvplus": "appletvplus",
  "apple-tv": "appletv",
  "apple-tv+": "appletvplus",
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
  "itv player": "itvplayer",
  itvx: "itvplayer",
  chili: "chili",
  starz: "starz",
};

/**
 * Returns the URL to a platform logo from /public/logos/
 * Returns null if no known logo exists.
 */
export function getPlatformLogo(name) {
  if (!name) return null;

  let normalized = name.toLowerCase().trim();

  // Replace symbols and normalize common forms
  normalized = normalized
    .replace(/[+]/g, " plus")
    .replace(/[\-_.]/g, " ")
    .replace(/\s+/g, " ");

  // Handle known Apple TV variants explicitly
  if (
    normalized.includes("apple tv") ||
    normalized.includes("appletv") ||
    normalized.includes("apple tv plus") ||
    normalized.includes("appletv plus") ||
    normalized.includes("apple tv app")
  ) {
    if (normalized.includes("plus")) return "/logos/appletvplus.svg";
    return "/logos/appletv.svg";
  }

  const key = LOGO_MAP[normalized] || LOGO_MAP[normalized.replace(/\s+/g, "")];
  if (key) return `/logos/${key}.svg`;

  console.warn(`Unknown streaming platform: "${name}"`);
  return null;
}

/**
 * Normalizes platform names and removes duplicates.
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
        case "appletv":
          return "Apple TV";
        case "apple tv+":
        case "apple tv plus":
        case "appletv+":
        case "appletvplus":
        case "apple tv app":
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
        case "itv player":
        case "itvx":
          return "ITV Player";
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

/** Capitalize each word for display */
function capitalizeWords(str = "") {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
