// src/services/mappers/showMapper.js
export const mergeDetails = (wm, tmdb) => {
  // 🎬 Poster and backdrop with fallbacks
  const poster =
    wm.poster_url ||
    (tmdb?.poster_path ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}` : wm.image_url || null);

  const backdrop =
    wm.backdrop_url ||
    (tmdb?.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}` : null);

  // 🕒 Runtime (supports both movies & TV)
  let rawRuntime = null;

  if (tmdb?.runtime && tmdb.runtime > 0) {
    rawRuntime = tmdb.runtime;
  } else if (Array.isArray(tmdb?.episode_run_time) && tmdb.episode_run_time.length > 0) {
    rawRuntime = tmdb.episode_run_time[0];
  } else if (wm?.runtime_minutes && wm.runtime_minutes > 0) {
    rawRuntime = wm.runtime_minutes;
  }

  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const runtimeText = formatRuntime(rawRuntime);

  console.log("🧩 Merging details for:", wm.title || tmdb?.title || tmdb?.name, {
    tmdb_runtime: tmdb?.runtime,
    tmdb_episode_run_time: tmdb?.episode_run_time,
    wm_runtime_minutes: wm.runtime_minutes,
    resolved_runtime: rawRuntime,
  });

  // 🧠 Merge all fields safely
  return {
    id: wm.id || tmdb?.id,
    title: wm.title || tmdb?.title || tmdb?.name || "Untitled",
    type: wm.type || (tmdb?.media_type === "tv" ? "tv" : "movie"),
    year:
      wm.year ||
      tmdb?.release_date?.slice(0, 4) ||
      tmdb?.first_air_date?.slice(0, 4) ||
      null,
    poster,
    backdrop,
    overview: wm.plot_overview || tmdb?.overview || "No overview available.",
    rating: wm.user_rating || tmdb?.vote_average || null,
    genres: tmdb?.genres?.map((g) => g.name) || [],
    runtime: rawRuntime ?? null,      // numeric minutes
    runtimeText: runtimeText ?? "N/A", // readable format (e.g. 1h 2m)
    trailer: wm.trailer || tmdb?.trailer || null,
  };
};
