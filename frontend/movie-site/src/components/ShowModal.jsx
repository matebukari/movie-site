import React, { useEffect, useState } from "react";
import { X, Globe2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPlatformLogo } from "../utils/getPlatformLogo";

function ShowModal({ show, country, onClose }) {
  const [details, setDetails] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Close modal with ESC
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Fetch platform availability
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
        const data = await res.json();

        console.log(
          "Platforms fetched for:",
          show?.title || show?.name,
          "→",
          data.platforms || []
        );

        setPlatforms(data.platforms || []);
        setDetails(show);
      } catch (err) {
        console.error("Failed to fetch show platforms:", err);
        setDetails(show);
      } finally {
        setLoading(false);
      }
    };

    if (show?.id) fetchPlatforms();
  }, [show, country]);

  const genres = details?.genres?.length ? details.genres.join(", ") : "Unknown";

  // Runtime display
  let runtime = null;
  const invalidValues = ["n/a", "na", "none", "-", ""];

  if (details?.runtimeText && !invalidValues.includes(details.runtimeText.trim().toLowerCase())) {
    runtime =
      details.type?.toLowerCase().includes("tv")
        ? `${details.runtimeText} per episode`
        : details.runtimeText;
  } else if (typeof details?.runtime === "number" && details.runtime > 0) {
    runtime =
      details.type?.toLowerCase().includes("tv")
        ? `${details.runtime} min per episode`
        : `${details.runtime} min`;
  }

  return (
    <AnimatePresence mode="wait">
      {details && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-50
                         bg-black/70 hover:bg-black/90
                         text-white hover:text-red-400
                         p-3 rounded-full cursor-pointer
                         transition-all duration-200
                         border border-white/20 shadow-lg"
              style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              <X size={24} strokeWidth={2.8} />
            </button>

            {/* Banner */}
            <div className="relative">
              <img
                src={details?.backdrop || details?.poster || "/placeholder-poster.jpg"}
                alt={details?.title}
                className="w-full h-72 object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  {details?.title}
                </h2>
                <p className="text-gray-300 text-sm">
                  {details?.year} • {details?.type} • ⭐{" "}
                  {details?.rating ? details.rating.toFixed(1) : "N/A"}
                </p>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-6 space-y-5">
              {loading ? (
                <p className="text-gray-400 italic">Loading details...</p>
              ) : (
                <>
                  {/* Overview */}
                  <p className="text-gray-200 text-base leading-relaxed">
                    {details?.overview || "No description available."}
                  </p>

                  {/* Metadata Badges */}
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

                  {/* Trailer Button */}
                  {details?.trailer && (
                    <motion.a
                      href={details.trailer}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      <PlayCircle size={18} />
                      Watch Trailer
                    </motion.a>
                  )}

                  {/* Streaming Platforms */}
                  {platforms.length > 0 ? (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Available to stream on:
                      </h3>
                      <motion.div
                        className="flex flex-wrap gap-4 items-center"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                        }}
                      >
                        {platforms.map((p, i) => {
                          const logo = getPlatformLogo(p);
                          const isTextOnly = !logo;

                          return (
                            <motion.div
                              key={i}
                              className="relative group bg-gray-800 rounded-xl p-2 shadow hover:shadow-lg transition flex items-center justify-center min-w-[90px] min-h-10"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.97 }}
                              variants={{
                                hidden: { opacity: 0, y: 5 },
                                visible: { opacity: 1, y: 0 },
                              }}
                            >
                              {isTextOnly ? (
                                <span className="text-gray-300 text-sm font-medium">{p}</span>
                              ) : (
                                <img
                                  src={logo}
                                  alt={p}
                                  className="h-6 w-auto object-contain mx-auto cursor-pointer"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.insertAdjacentHTML(
                                      "afterend",
                                      `<span class='text-gray-300 text-sm font-medium'>${p}</span>`
                                    );
                                  }}
                                />
                              )}

                              {/* Tooltip */}
                              <div
                                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                                           bg-black text-white text-xs font-medium px-2 py-1 rounded
                                           opacity-0 group-hover:opacity-100 transition-opacity
                                           whitespace-nowrap pointer-events-none z-20"
                              >
                                {p}
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No streaming platforms found in your region ({country.toUpperCase()}).
                    </p>
                  )}
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
