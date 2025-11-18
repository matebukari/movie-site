import { useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export default function useShowDetails(country) {
  const [selectedShow, setSelectedShow] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadShowDetails = useCallback(async (show) => {
    try {
      setLoadingDetails(true);

      // Fetch full details
      const detailsRes = await fetch(`${API_BASE}/titles/${show.id}`);
      const details = await detailsRes.json();

      // Fetch platform availability
      const platformsRes = await fetch(
        `${API_BASE}/titles/${show.id}/sources?country=${country}`
      );
      const platformsData = await platformsRes.json();

      // Merge everything
      setSelectedShow({
        ...show,
        ...details,
        platforms: platformsData.platforms || [],
      });

    } catch (err) {
      console.error("Error loading show details:", err);
    } finally {
      setLoadingDetails(false);
    }
  }, [country]);

  return { selectedShow, setSelectedShow, loadShowDetails, loadingDetails };
}
