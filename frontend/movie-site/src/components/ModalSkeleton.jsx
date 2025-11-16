export default function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-48 w-full bg-gray-800 rounded-lg" />

      <div className="space-y-2">
        <div className="h-4 w-3/4 bg-gray-800 rounded" />
        <div className="h-4 w-1/2 bg-gray-800 rounded" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-800 rounded" />
        <div className="h-3 w-5/6 bg-gray-800 rounded" />
        <div className="h-3 w-2/3 bg-gray-800 rounded" />
      </div>

      <div className="flex gap-2">
        <div className="h-8 w-20 bg-gray-800 rounded" />
        <div className="h-8 w-16 bg-gray-800 rounded" />
      </div>
    </div>
  );
}
