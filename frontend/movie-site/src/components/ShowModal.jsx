import { useEffect, useState } from "react";
import { X, Globe2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPlatformLogo } from "../utils/getPlatformLogo";

export default function ShowModal({ show, country, onClose }) {
  const [details, setDetails] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Fetch streaming platforms
  useEffect(() => {
    if (!show?.id) return;

    const fetchPlatforms = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/titles/${show.id}/sources?country=${country}`);
        const data = await res.json();

        setPlatforms(data.platforms || []);
        setDetails(show);
      } catch (err) {
        console.error("Failed to fetch show platforms:", err);
        setDetails(show);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, [show, country]);

  // Genre + runtime formatting
  const genres = details?.genres?.length ? details.genres.join(", ") : "Unknown";

  const formatRuntime = () => {
    const invalid = ["n/a", "na", "none", "-", ""];
    const rt = details?.runtimeText?.trim()?.toLowerCase();

    if (rt && !invalid.includes(rt)) {
      return details.type?.toLowerCase().includes("tv")
        ? `${details.runtimeText} per episode`
        : details.runtimeText;
    }

    if (typeof details?.runtime === "number" && details.runtime > 0) {
      return details.type?.toLowerCase().includes("tv")
        ? `${details.runtime} min per episode`
        : `${details.runtime} min`;
    }

    return null;
  };

  const runtime = formatRuntime();

  return (
    <AnimatePresence mode="wait">
      {details && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-4xl rounded-2xl bg-gray-900 shadow-2xl overflow-hidden"
          >
            {/* Close button */}
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

            {/* Banner / Backdrop */}
            <div className="relative">
              <img
                src={details.backdrop || details.poster || "/placeholder-poster.jpg"}
                alt={details.title}
                className="h-72 w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">
                  {details.title}
                </h2>
                <p className="text-gray-300 text-sm">
                  {details.year} • {details.type} • ⭐{" "}
                  {details.rating ? details.rating.toFixed(1) : "N/A"}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {loading ? (
                <p className="text-gray-400 italic">Loading details...</p>
              ) : (
                <>
                  {/* Overview */}
                  <p className="text-gray-200 text-base leading-relaxed">
                    {details.overview || "No description available."}
                  </p>

                  {/* Metadata badges */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                      ⭐ {details.rating ? details.rating.toFixed(1) : "N/A"}
                    </span>

                    {runtime && (
                      <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                        ⏱ {runtime}
                      </span>
                    )}

                    <span className="bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                      {genres}
                    </span>

                    <span className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full text-gray-300">
                      <Globe2 size={14} /> {country.toUpperCase()}
                    </span>
                  </div>

                  {/* Trailer Button */}
                  {details.trailer && (
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

                  {/* Platforms */}
                  {platforms.length > 0 ? (
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-white">
                        Available to stream on:
                      </h3>
                      <motion.div
                        className="flex flex-wrap items-center gap-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                        }}
                      >
                        {platforms.map((p, i) => (
                          <motion.div
                            key={i}
                            className="p-2 bg-gray-800 rounded-xl shadow hover:shadow-lg transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            variants={{
                              hidden: { opacity: 0, y: 5 },
                              visible: { opacity: 1, y: 0 },
                            }}
                          >
                            <img
                              src={getPlatformLogo(p)}
                              alt={p}
                              className="h-6 w-auto object-contain"
                              onError={(e) => (e.currentTarget.src = "/logos/default.svg")}
                            />
                          </motion.div>
                        ))}
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
