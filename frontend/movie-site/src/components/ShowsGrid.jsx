import { useState, useEffect } from "react";
import ShowCard from "./ShowCard";
import SkeletonCard from "./SkeletonCard";

export default function ShowsGrid({
  shows = [],
  loading = false,
  error = "",
  emptyMessage = "No shows found.",
  onShowClick = () => {},
}) {
  const [columns, setColumns] = useState(1);

  // Detect grid column count based on screen size
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setColumns(3); // lg
      else if (window.innerWidth >= 640) setColumns(2); // sm
      else setColumns(1); // mobile
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  // Initial loading, no shows yet
  if (loading && shows.length === 0) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6`}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  if (!loading && shows.length === 0) {
    return <p className="text-center mt-10 text-gray-400">{emptyMessage}</p>;
  }

  return (
    <>
      {/* Normal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} onClick={() => onShowClick(show)} />
        ))}
      </div>

      {/* Dynamic-sized "Loading more" skeleton row */}
      {loading && shows.length > 0 && (
        <div
          className="grid gap-6 mt-6"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonCard key={`loading-more-${i}`} />
          ))}
        </div>
      )}
    </>
  );
}
