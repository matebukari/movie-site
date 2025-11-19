import { useState, useCallback } from "react";
import { fetchShowsGeneric } from "./useFetchShows";

const FAST_FIELDS = "id,title,poster,backdrop,year,type";
const API_BASE = import.meta.env.VITE_API_URL;

export default function useShowFetcher({
  country,
  countryDetected,
  setCache,
  runLocked,
  PAGE_LIMIT = 9,
  MAX_SHOWS = 102,
}) {
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const dedupe = (arr) =>
    Array.from(new Map(arr.map((s) => [s.id, s])).values());

  const fetchPage = useCallback(
    async ({ endpoint, reset = false }) => {
      if (!countryDetected || loading) return;

      return runLocked(async () => {
        if (!reset && shows.length >= MAX_SHOWS) {
          setHasMore(false);
          return;
        }

        setLoading(true);
        setError("");

        const currentPage = reset ? 1 : page;

        const sep = endpoint.includes("?") ? "&" : "?";
        const url =
          `${API_BASE}${endpoint}${sep}` +
          `country=${country}` +
          `&limit=${PAGE_LIMIT}` +
          `&page=${currentPage}` +
          `&fields=${FAST_FIELDS}`;

        try {
          const { results: incoming } = await fetchShowsGeneric(
            url,
            reset ? [] : shows
          );

          if (!incoming.length) {
            setHasMore(false);
            return;
          }

          let merged = reset
            ? incoming
            : dedupe([...shows, ...incoming]);

          if (merged.length >= MAX_SHOWS) {
            merged = merged.slice(0, MAX_SHOWS);
            setHasMore(false);
          }

          setShows(merged);
          setCache?.(merged, currentPage + 1, true);
          setPage(currentPage + 1);
        } catch (err) {
          console.error("❌ Fetch error:", err);
          setError("Error loading shows");
        } finally {
          setLoading(false);
        }
      });
    },
    [
      country,
      countryDetected,
      page,
      shows,
      loading,
      runLocked,
      setCache
    ]
  );

  return {
    shows,
    setShows,
    page,
    setPage,
    loading,
    hasMore,
    setHasMore,
    error,
    fetchPage,
  };
}
