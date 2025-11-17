import { getWatchmodeTitleDetails } from "../api/watchmode.js";
import { fetchTMDBDetails } from "../api/tmdb.js";
import { mergeDetails } from "../mappers/showMapper.js";

export const fetchFullShowDetails = async (id) => {
  try {
    // 1. Fetch full Watchmode metadata
    const wmRes = await getWatchmodeTitleDetails(id);
    const wm = wmRes?.data;

    if (!wm) return null;

    // 2. Fetch TMDB metadata (poster, backdrop, trailer, runtime)
    const tmdb = await fetchTMDBDetails({
      tmdb_id: wm.tmdb_id,
      title: wm.title,
      type: wm.type,
    });

    // 3. Merge Watchmode + TMDB into your unified object
    return mergeDetails(wm, tmdb);

  } catch (err) {
    console.error("❌ Error in fetchFullShowDetails:", err.message);
    return null;
  }
};
