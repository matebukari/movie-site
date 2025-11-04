import { getWatchmodeList } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchPopularShows = async (country = "us", limit = 15, page = 1) => {
 const cacheKey = `popular-${country}-${page}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    console.log(`🔥 Fetching popular titles for ${country.toUpperCase()} (page ${page})`);

    const { data } = await getWatchmodeList({
      regions: country.toUpperCase(),
      limit,
      page,
      titleTypes: "movie,tv_series,tv_miniseries",
      sort_by: "popularity_desc", // ⭐ Most popular content
    });

    if (!data || !Array.isArray(data.titles)) {
      console.warn("⚠️ Watchmode returned unexpected data:", data);
      return [];
    }

    const shows = data.titles;

    const detailed = await Promise.all(
      shows.map(async (wm) => {
        try {
          const tmdb = await fetchTMDBDetails({
            tmdb_id: wm.tmdb_id,
            title: wm.title,
            type: wm.type,
          });
          return mergeDetails(wm, tmdb);
        } catch (err) {
          console.warn(`⚠️ TMDB fetch failed for ${wm.title}: ${err.message}`);
          return null;
        }
      })
    );

    const results = detailed.filter((s) => s?.poster);
    await setCache(cacheKey, results);
    console.log(`✅ Cached ${results.length} popular titles for ${country}`);
    return results;
  } catch (err) {
    console.error("❌ Error in fetchPopularShows:", err.message);
    return [];
  }
};
