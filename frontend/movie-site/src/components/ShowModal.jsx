import React, { useEffect, useState } from "react";
import { X, Globe2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModalSkeleton from "./ModalSkeleton";
import { getPlatformLogo } from "../utils/getPlatformLogo";

function ShowModal({ show, country, onClose }) {
  const API_BASE = import.meta.env.VITE_API_URL;

  // Local state for platform details
  const [platforms, setPlatforms] = useState(show.platforms || null);
  const [details] = useState(show);
  const [hdLoaded, setHdLoaded] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(!show.platforms);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    // Disable background scroll
    document.body.style.overflow = "hidden";

    // Re-enable scroll when modal closes
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const preventScroll = (e) => e.preventDefault();
    document.body.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.removeEventListener("touchmove", preventScroll);
    };
  }, []);



  // Fetch platforms in background
  useEffect(() => {
    if (!show?.id || show.platforms) return;

    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true);

        const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
        const data = await res.json();

        setPlatforms(data.platforms || []);
      } catch {
        setPlatforms([]);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, [show, country]);

  // Build genres
  const genres = details?.genres?.length ? details.genres.join(", ") : "Unknown";

  // Runtime handling
  let runtime = null;
  const invalidValues = ["n/a", "na", "none", "-", ""];
  if (details?.runtimeText && !invalidValues.includes(details.runtimeText.trim().toLowerCase())) {
    runtime = details.type?.includes("TV")
      ? `${details.runtimeText} per episode`
      : details.runtimeText;
  } else if (details?.runtime > 0) {
    runtime = details.type?.includes("TV")
      ? `${details.runtime} min per episode`
      : `${details.runtime} min`;
  }

  // Low-res placeholder (poster) → HD backdrop swap
  const lowResImg = details?.poster;
  const fullResImg = details?.backdrop;

  return (
    <AnimatePresence>
      {details && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-999 p-4"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="fixed top-6 right-6 z-1000
                       bg-black/70 hover:bg-black/90
                       text-white hover:text-red-400
                       p-3 rounded-full border border-white/20 shadow-lg"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full 
           max-h-[90vh] modal-scroll"

          >
            {/* Banner */}
            <div className="relative">
              {/* Low-res image instantly visible */}
              <img
                src={lowResImg}
                className="w-full h-72 object-cover blur-[1px] brightness-[0.9]"
              />

              {/* Full HD image loading in background */}
              {fullResImg && (
                <img
                  src={fullResImg}
                  onLoad={() => setHdLoaded(true)}
                  className={`w-full h-72 object-cover absolute top-0 left-0 transition-opacity duration-500 ${
                    hdLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h2 className="text-3xl font-bold text-white drop-shadow">
                  {details?.title}
                </h2>
                <p className="text-gray-300 text-sm">
                  {details?.year} • {details?.type} • ⭐{" "}
                  {details?.rating ? details.rating.toFixed(1) : "N/A"}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* If platforms/data are still loading → skeleton */}
              {loadingPlatforms ? (
                <ModalSkeleton />
              ) : (
                <>
                  <p className="text-gray-200 text-base leading-relaxed">
                    {details?.overview || "No description available."}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                      ⭐ {details?.rating ? details.rating.toFixed(1) : "N/A"}
                    </span>
                    {runtime && (
                      <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                        ⏱ {runtime}
                      </span>
                    )}
                    <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                      {genres}
                    </span>
                    <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300 flex items-center gap-1">
                      <Globe2 size={14} /> {country.toUpperCase()}
                    </span>
                  </div>

                  {/* Trailer */}
                  {details?.trailer && (
                    <a
                      href={details.trailer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <PlayCircle size={18} />
                      Watch Trailer
                    </a>
                  )}

                  {/* Platforms */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Available on:
                    </h3>

                    {platforms.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {platforms.map((p, i) => {
                          const logo = getPlatformLogo(p);
                          return (
                            <div
                              key={i}
                              className="bg-gray-800 p-2 rounded-lg shadow flex items-center justify-center min-w-[90px] min-h-10"
                            >
                              {logo ? (
                                <img
                                  src={logo}
                                  alt={p}
                                  className="h-6 object-contain"
                                />
                              ) : (
                                <span className="text-gray-300">{p}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        No platforms found for your region.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ShowModal;
