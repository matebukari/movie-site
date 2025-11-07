import { getWatchmodeSources } from "../api/watchmode.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchShowSources = async (showId, country = "us") => {
  const cacheKey = `sources-${showId}-${country}`;
  const cached = await getCache(cacheKey); // ✅ await this
  if (cached) {
    console.log(`⚡ Using cached sources for ${showId} (${country})`);
    return cached;
  }

  try {
    const { data } = await getWatchmodeSources(showId, country.toUpperCase());

    if (!data || !Array.isArray(data)) {
      console.warn("⚠️ Watchmode returned unexpected source data:", data);
      await setCache(cacheKey, []); // cache empty array to prevent spam requests
      return [];
    }

    // Extract unique, human-readable platform names
    const platforms = Array.from(
      new Set(
        data
          .map((s) => s.name?.trim())
          .filter(Boolean)
      )
    );

    if (platforms.length === 0) {
      console.log(`⚠️ No streaming sources found for ${showId} in ${country}`);
    } else {
      console.log(`✅ Found ${platforms.length} sources for ${showId} (${country})`);
    }

    await setCache(cacheKey, platforms);
    return platforms;
  } catch (err) {
    console.error("❌ Error in fetchShowSources:", err.message);
    await setCache(cacheKey, []); // cache empty on error
    return [];
  }
};
