// Combines Watchmode and TMDB data into a single normalized object
export const mergeDetails = (wm, tmdb) => ({
  id: wm.id,
  title: wm.title || tmdb?.title || tmdb?.name || null,
  type: wm.type || tmdb?.media_type || null,
  year: wm.year || (tmdb?.release_date || tmdb?.first_air_date || "").slice(0, 4),
  poster:
    (tmdb?.poster_path
      ? `https://image.tmdb.org/t/p/w500${tmdb.poster_path}`
      : wm.poster_url || wm.poster || null),
  backdrop:
    (tmdb?.backdrop_path
      ? `https://image.tmdb.org/t/p/original${tmdb.backdrop_path}`
      : wm.backdrop || null),
  overview: tmdb?.overview || wm.plot_overview || null,
  trailer: wm.trailer || null,
});
