function ShowCard({ show, onClick }) {
  return(
    <div
      onClick={() => onClick && onClick(show)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md hower:shadow-lg transition curser-pointer"
    >
      <h2 className="text-lg font-semibold mb-1">{show.title}</h2>
      <p className="text-sm text-gray-400 mb-2">
        {show.year ? `(${show.year})` : ""}
      </p>

      {show.platforms?.length > 0 && (
        <div className="mt-2 text-sm text-gray-200">
          <span className="font-semibold">Platforms: </span>
          {show.platforms.join(", ")}
        </div>
      )}
    </div>
  );
}

export default ShowCard;