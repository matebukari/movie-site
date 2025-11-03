import { useState, useEffect, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

function ShowCard({ show, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const hoverTimeout = useRef(null);

  // 📱 Detect mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🎥 Identify YouTube trailers
  const isYouTubeTrailer =
    show.trailer?.includes("youtube.com") || show.trailer?.includes("youtu.be");

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;

    if (url.includes("watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }

    // 🧩 Hide recommended videos and clean branding
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&showinfo=0`
      : null;
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(show.trailer);

  // 🧭 Handle hover preview
  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = setTimeout(() => setIsHovered(true), 500);
    }
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    if (!isMobile) {
      setIsHovered(false);

      // 🎞️ Reset video trailer (MP4)
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }

      // 📺 Reset YouTube trailer (reload iframe)
      if (iframeRef.current) {
        const src = iframeRef.current.src;
        iframeRef.current.src = "";
        iframeRef.current.src = src;
      }
    }
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(show);
  };

  const imageSrc = isMobile
    ? show.poster || show.backdrop
    : show.backdrop || show.poster;

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-md transition-all duration-500 ease-in-out cursor-pointer hover:shadow-lg opacity-0 animate-fadeIn"
    >
      {/* 🖼️ Static Poster / Backdrop */}
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

      {/* 🎬 Trailer Preview on Hover (non-clickable layer) */}
      {show.trailer && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isHovered ? "opacity-100 pointer-events-none" : "opacity-0 pointer-events-none"
          }`}
        >
          {isYouTubeTrailer ? (
            <iframe
              ref={iframeRef}
              src={youtubeEmbedUrl}
              title={`${show.title} trailer`}
              className="w-full h-full object-cover"
              allow="autoplay; encrypted-media"
            ></iframe>
          ) : (
            <video
              ref={videoRef}
              src={show.trailer}
              autoPlay={isHovered}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* 🧾 Info overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 
          transition-opacity duration-500 ${isHovered ? "opacity-0" : "opacity-100"}`}
      >
        <h2 className="text-lg font-semibold text-white truncate">{show.title}</h2>
        <p className="text-sm text-gray-300">
          {show.year ? `(${show.year})` : ""} • {show.type || ""}
        </p>
      </div>
    </div>
  );
}

export default ShowCard;
