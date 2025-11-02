// Simple in-memory cache shared by all services
const cache = new Map();

export const getCache = (key) => cache.get(key);

export const setCache = (key, value, ttl = 5 * 60 * 1000) => {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttl);
};
