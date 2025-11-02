import { getWatchmodeSearch } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchShowsBySearch = async (query, country = "us", page = 1) => {
  const cacheKey = `search-${query}-${country}-${page}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data } = await getWatchmodeSearch({
    search_field: "name",
    search_value: query,
    fuzzy_search: true,
    page,
    limit: 12,
    regions: country.toUpperCase(),
  });

  const shows = data.title_results || [];
  const results = await Promise.all(
    shows.map(async (wm) => {
      const tmdb = await fetchTMDBDetails({
        tmdb_id: wm.tmdb_id,
        title: wm.name,
        type: wm.type,
      });
      return mergeDetails(wm, tmdb);
    })
  );

  setCache(cacheKey, results);
  return results;
};
