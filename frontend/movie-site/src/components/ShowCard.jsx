import { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function ShowCard({ show, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isYouTubeTrailer =
    show.trailer?.includes("youtube.com") || show.trailer?.includes("youtu.be");

  useEffect(() => {
    if (!isHovered) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; 
      }

      if (iframeRef.current) {
        const src = iframeRef.current.src;
        iframeRef.current.src = ""; 
        iframeRef.current.src = src; 
      }
    }
  }, [isHovered]);

  const imageSrc = isMobile
    ? show.poster || show.backdrop
    : show.backdrop || show.poster;

  let hoverTimeout;

  return (
    <div
      onClick={() => onClick && onClick(show)}
      onMouseEnter={() => {
        if (!isMobile) {
          hoverTimeout = setTimeout(() => setIsHovered(true), 800)
        }
      }}
      onMouseLeave={() => {
        clearTimeout(hoverTimeout);
        if (!isMobile) setIsHovered(false);
      }}
      className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
    >
      <div
        className={`transition-opacity duration-500 ${
          isHovered && show.trailer ? "opacity-0" : "opacity-100"
        }`}
      >
        <LazyLoadImage
          src={imageSrc || "/placeholder-poster.jpg"}
          alt={show.title}
          effect="blur"
          className="w-full h-64 md:h-80 object-cover"
        />
      </div>

      {show.trailer && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {isYouTubeTrailer ? (
            <iframe
              ref={iframeRef}
              src={`${show.trailer.replace("watch?v=", "embed/")}?autoplay=1&mute=1&loop=1&controls=0&playlist=${
                show.trailer.split("v=")[1]
              }`}
              title={`${show.title} trailer`}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media"
            ></iframe>
          ) : (
            <video
              ref={videoRef}
              src={show.trailer}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 ${
        isHovered ? "opacity-0" : "opacity-100"
      }`}>
        <h2 className="text-lg font-semibold text-white truncate">
          {show.title}
        </h2>
        <p className="text-sm text-gray-300">
          {show.year ? `(${show.year})` : ""} • {show.type || ""}
        </p>
      </div>
    </div>
  );
}

export default ShowCard;
