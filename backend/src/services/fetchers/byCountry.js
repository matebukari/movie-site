import { getWatchmodeList } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchShowsByCountry = async (country, limit = 10, page = 1) => {
  const cacheKey = `country-${country}-${page}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data } = await getWatchmodeList({
    regions: country.toUpperCase(),
    limit,
    page,
  });

  const shows = data.titles || [];

  const detailed = await Promise.all(
    shows.map(async (wm) => {
      const tmdb = await fetchTMDBDetails({
        tmdb_id: wm.tmdb_id,
        title: wm.title,
        type: wm.type,
      });
      return mergeDetails(wm, tmdb);
    })
  );

  const results = detailed.filter((show) => show.poster);

  setCache(cacheKey, results);
  return results;
};
