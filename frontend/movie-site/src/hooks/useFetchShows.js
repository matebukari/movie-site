const MAX_SHOWS = 102;

export async function fetchShowsGeneric(endpoint, prevShows = []) {
  const res = await fetch(endpoint);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch shows");

  const incoming = data.results || [];

  // 1️⃣ Create a map from prevShows (start with existing)
  const map = new Map();
  for (const show of prevShows) {
    if (show?.id) map.set(show.id, show);
  }

  // 2️⃣ Merge new results, replacing if more complete
  for (const show of incoming) {
    if (!show?.id) continue;
    const existing = map.get(show.id);

    const completeness = (obj) =>
      Object.values(obj || {}).filter((v) => v !== null && v !== undefined).length;

    if (!existing || completeness(show) > completeness(existing)) {
      map.set(show.id, show);
    }
  }

  // 3️⃣ Convert back to array — fully deduped before returning
  const results = [...map.values()].slice(0, MAX_SHOWS);

  // 4️⃣ Determine if the API still has more pages
  const hasMore =
    results.length < MAX_SHOWS && incoming.length > 0;

  return { results, hasMore };
}
