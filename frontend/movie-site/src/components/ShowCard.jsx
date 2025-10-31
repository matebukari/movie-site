import { useEffect } from "react";
import { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function ShowCard({ show, onClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() =>{
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const imageSrc = isMobile
    ? show.poster || show.backdrop
    : show.backdrop || show.poster;


  return(
    <div
      onClick={() => onClick && onClick(show)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition cursor-pointer"
    >
      {imageSrc ? (
        <LazyLoadImage
          src={imageSrc}
          alt={show.title}
          effect="blur"
          className={`w-full object-cover rounded-md ${
            isMobile ? "h-72" : "h-48"
          }`}
        />
      ): (
        <div className="w-full h-64 bg-gray-800 flex items-center justify-center text-gray-500 text-sm">
          No Image Available
        </div>
      )}

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1">{show.title}</h2>
        <p className="text-sm text-gray-400 mb-2">
          {show.year ? `(${show.year})` : ""}
        </p>
        <p className="text-sm capitalize text-gray-300">
          {show.type ? `${show.type}` : ""}
        </p>

        {show.platforms?.length > 0 && (
          <div className="mt-2 text-sm text-gray-200">
            <span className="font-semibold">Platforms: </span>
            {show.platforms.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShowCard;