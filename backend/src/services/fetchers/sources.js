import { getWatchmodeSources } from "../api/watchmode.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchShowSources = async (showId, country = "us") => {
  const cacheKey = `sources-${showId}-${country}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data } = await getWatchmodeSources(showId, country.toUpperCase());
  const platforms = [...new Set((data || []).map((s) => s.name))];

  setCache(cacheKey, platforms);
  return platforms;
};
