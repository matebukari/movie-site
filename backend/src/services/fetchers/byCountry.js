import { getWatchmodeList } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchShowsByCountry = async (country, limit = 10, page = 1) => {

  const cacheKey = `country-${country}-${page}`;
  const cached = await getCache(cacheKey);

  if (Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  try {
    const { data } = await getWatchmodeList({
      regions: country?.toUpperCase() || "US",
      limit,
      page,
    });


    if (!data || !Array.isArray(data.titles)) {
      console.warn("⚠️ Unexpected Watchmode data format:", data);
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
          console.warn(`⚠️ TMDB fetch failed for ${wm.title}:`, err.message);
          return null;
        }
      })
    );

    const results = detailed.filter((show) => show?.poster);
    await setCache(cacheKey, results);

    return results;
  } catch (err) {
    console.error("❌ Error inside fetchShowsByCountry:", err);
    return [];
  }
};
