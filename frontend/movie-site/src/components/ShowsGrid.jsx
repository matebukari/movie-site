import ShowCard from "./ShowCard";
import SkeletonCard from "./SkeletonCard";

export default function ShowsGrid({
  shows = [],
  loading = false,
  error = "",
  emptyMessage = "No shows found.",
  onShowClick = () => {},
}) {
  // Show skeletons while loading and no results yet
  if (loading && shows.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Show error if any
  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  // No results
  if (!loading && shows.length === 0 && !error) {
    return <p className="text-center mt-10 text-gray-400">{emptyMessage}</p>;
  }

  // Normal grid of shows
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {shows.map((show) => (
        <ShowCard key={show.id} show={show} onClick={() => onShowClick(show)} />
      ))}
    </div>
  );
}
