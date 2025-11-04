// src/services/fetchers/newReleases.js
import { getWatchmodeList } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchNewReleases = async (country = "us", limit = 15, page = 1) => {
  const cacheKey = `new-${country}-${page}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    console.log(`📅 Fetching newest titles for ${country.toUpperCase()} (page ${page})`);

    const { data } = await getWatchmodeList({
      regions: country.toUpperCase(),
      limit,
      page,
      sort_by: "release_date_desc", // ✅ Key change
      title_types: "movie,tv_series,tv_movie,tv_special,tv_miniseries,short_film", // ✅ Valid Watchmode types
    });

    if (!data || !Array.isArray(data.titles)) {
      console.warn("⚠️ Watchmode returned unexpected data:", data);
      return [];
    }

    console.log(`📦 Watchmode returned ${data.titles.length} titles for new releases (${country})`);

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
          console.warn(`⚠️ TMDB fetch failed for "${wm.title}": ${err.message}`);
          return null;
        }
      })
    );

    const results = detailed.filter((s) => s?.poster);
    await setCache(cacheKey, results);

    console.log(`✅ Cached ${results.length} new releases for ${country}`);
    return results;
  } catch (err) {
    console.error("❌ Error in fetchNewReleases:", err.message);
    return [];
  }
};
