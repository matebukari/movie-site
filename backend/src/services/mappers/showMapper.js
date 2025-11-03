// src/services/mappers/showMapper.js

export const mergeDetails = (wm, tmdb) => {
  // Choose poster in correct priority order
  const poster =
    tmdb?.poster ||
    wm.poster_url ||
    (wm.image_url ? wm.image_url : null);

  const backdrop =
    tmdb?.backdrop ||
    wm.backdrop_url ||
    null;

  return {
    id: wm.id,
    title: wm.title,
    type: wm.type,
    year: wm.year || tmdb?.release_date?.slice(0, 4) || null,
    poster,
    backdrop,
    overview: tmdb?.overview || wm.plot_overview || null,
    rating: tmdb?.rating || wm.user_rating || null,
    trailer: tmdb?.trailer || wm.trailer || null,
  };
};
