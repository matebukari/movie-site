import { getWatchmodeSearch } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchShowsBySearch = async (query, country = "us", page = 1) => {
  const cacheKey = `search-${query}-${country}-${page}`;
  const cached = await getCache(cacheKey); // ✅ await here
  if (cached) {
    console.log(`⚡ Returning cached search results for "${query}" (${country})`);
    return cached;
  }

  try {
    const { data } = await getWatchmodeSearch({
      search_field: "name",
      search_value: query,
      fuzzy_search: true,
      page,
      limit: 12,
      regions: country.toUpperCase(),
    });

    if (!data || !Array.isArray(data.title_results)) {
      console.warn("⚠️ Watchmode returned unexpected search data:", data);
      return [];
    }

    const shows = data.title_results;

    const results = await Promise.all(
      shows.map(async (wm) => {
        try {
          const tmdb = await fetchTMDBDetails({
            tmdb_id: wm.tmdb_id,
            title: wm.name,
            type: wm.type,
          });
          return mergeDetails(wm, tmdb);
        } catch (err) {
          console.warn(`⚠️ TMDB fetch failed for ${wm.name}: ${err.message}`);
          return null;
        }
      })
    );

    const filtered = results.filter((s) => s?.poster);
    await setCache(cacheKey, filtered);
    console.log(`✅ Cached ${filtered.length} search results for "${query}" (${country})`);
    return filtered;
  } catch (err) {
    console.error("❌ Error in fetchShowsBySearch:", err.message);
    return []; // ✅ Always return an array to prevent crashes
  }
};
