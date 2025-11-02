import { getWatchmodeList } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchPopularShows = async (country = "us", limit = 15, page = 1) => {
  const cacheKey = `popular-${country}-${page}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data } = await getWatchmodeList({
    regions: country.toUpperCase(),
    limit,
    page,
    sort_by: "popularity",
  });

  const shows = data.titles || [];
  const results = await Promise.all(
    shows.map(async (wm) => {
      const tmdb = await fetchTMDBDetails({
        tmdb_id: wm.tmdb_id,
        title: wm.title,
        type: wm.type,
      });
      return mergeDetails(wm, tmdb);
    })
  );

  setCache(cacheKey, results);
  return results;
};
