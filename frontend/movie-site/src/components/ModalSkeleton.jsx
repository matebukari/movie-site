export default function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Title lines */}
      <div className="h-4 bg-gray-700/60 rounded w-3/4"></div>
      <div className="h-4 bg-gray-700/60 rounded w-full"></div>
      <div className="h-4 bg-gray-700/60 rounded w-5/6"></div>

      {/* Tags */}
      <div className="flex gap-3 mt-4">
        <div className="h-6 w-20 bg-gray-700/60 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-700/60 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-700/60 rounded-full"></div>
      </div>

      {/* Large block placeholder (platforms section, trailer, etc.) */}
      <div className="h-32 bg-gray-700/60 rounded-xl mt-4"></div>
    </div>
  );
}
