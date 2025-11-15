import { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

export default function ShowCard({ show, onClick }) {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const hoverTimeout = useRef(null);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine YouTube trailer
  const isYouTubeTrailer =
    show.trailer?.includes("youtube.com") || show.trailer?.includes("youtu.be");

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId =
      url.match(/v=([^&]+)/)?.[1] || url.match(/youtu\.be\/([^?]+)/)?.[1];
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0`
      : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(show.trailer);

  // Hover handlers
  const handleMouseEnter = () => {
    if (isMobile) return;
    clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setHovered(true), 400);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    if (isMobile) return;

    setHovered(false);

    // Reset trailer elements
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = "";
      iframeRef.current.src = src;
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(show);
  };

  const imageSrc = isMobile
    ? show.poster || show.backdrop
    : show.backdrop || show.poster;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden 
                 shadow-md transition-all duration-500 ease-in-out cursor-pointer 
                 hover:shadow-blue-900/20 hover:scale-[1.02] opacity-0 animate-fadeIn"
    >
      {/* Image layer */}
      <div
        className={`transition-opacity duration-500 ${
          hovered && show.trailer ? "opacity-0" : "opacity-100"
        }`}
      >
        <LazyLoadImage
          src={imageSrc || "/placeholder-poster.jpg"}
          alt={show.title}
          effect="blur"
          className="w-full h-64 md:h-80 object-cover"
        />
      </div>

      {/* Trailer preview (YouTube or video) */}
      {show.trailer && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          } pointer-events-none`}
        >
          {isYouTubeTrailer ? (
            <iframe
              ref={iframeRef}
              src={youtubeEmbedUrl}
              title={`${show.title} trailer`}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media"
            />
          ) : (
            <video
              ref={videoRef}
              src={show.trailer}
              autoPlay={hovered}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Info overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent 
                    p-4 transition-opacity duration-500 ${
                      hovered ? "opacity-0" : "opacity-100"
                    }`}
      >
        <h2 className="text-lg font-semibold text-white truncate">{show.title}</h2>
        <p className="text-sm text-gray-300">
          {show.year && `(${show.year})`} {show.year && show.type && " • "}{" "}
          {show.type || ""}
        </p>
      </div>
    </div>
  );
}
