const MAX_SHOWS = 102;

export async function fetchShowsGeneric(endpoint, prevShows = []) {
  const res = await fetch(endpoint);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

  const newShows = [...prevShows, ...(data.results || [])];

  // Deduplicate + prefer completeness
  const unique = Array.from(
    newShows.reduce((map, show) => {
      const existing = map.get(show.id);
      const completeness = (obj) =>
        Object.values(obj || {}).filter((v) => v !== null && v !== undefined).length;
      if (!existing || completeness(show) > completeness(existing)) map.set(show.id, show);
      return map;
    }, new Map()).values()
  );

  const limited = unique.slice(0, MAX_SHOWS);
  const hasMore = limited.length < MAX_SHOWS && (data.results?.length ?? 0) > 0;

  return { results: limited, hasMore };
}
