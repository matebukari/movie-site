import { getWatchmodeReleases } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";
import { getCache, setCache } from "../api/cache.js";

export const fetchNewReleases = async (country = "us", limit = 15, page = 1) => {
  const cacheKey = `new-${country}-${page}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data } = await getWatchmodeReleases({
    regions: country.toUpperCase(),
    limit,
    page,
  });

  const releases = data.releases || [];
  const results = await Promise.all(
    releases.map(async (wm) => {
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
