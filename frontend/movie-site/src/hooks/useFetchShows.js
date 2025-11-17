export async function fetchShowsGeneric(endpoint, prevShows = []) {
  const res = await fetch(endpoint);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

  const incoming = data.results || [];

  // Dedup using Map
  const map = new Map();
  for (const show of prevShows) {
    if (show?.id) map.set(show.id, show);
  }

  const completeness = (obj) =>
    Object.values(obj || {}).filter((v) => v !== null && v !== undefined).length;

  for (const show of incoming) {
    if (!show?.id) continue;

    const existing = map.get(show.id);

    if (!existing || completeness(show) > completeness(existing)) {
      map.set(show.id, show);
    }
  }

  // Convert to REAL array
  const results = Array.from(map.values());

  // API has more pages if it returned *any* results
  const hasMore = incoming.length > 0;

  return { results, hasMore };
}
