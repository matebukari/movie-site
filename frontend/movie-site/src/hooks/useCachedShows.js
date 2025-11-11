export default function useCachedShows(keyPrefix, country) {
  const cacheKey = `${keyPrefix}-${country}`;

  const getCache = () => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (parsed.country === country && Array.isArray(parsed.results)) return parsed;
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
    return null;
  };

  const setCache = (results, nextPage, hasMore) => {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ country, results, nextPage, hasMore })
    );
  };

  return { getCache, setCache };
}