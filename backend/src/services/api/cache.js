// src/services/api/cache.js
import Keyv from "keyv";

// ⚙️ Store cache on disk; swap URL for Redis if you want later
const keyv = new Keyv("sqlite://cache.sqlite");

export const getCache = async (key) => {
  try {
    return await keyv.get(key);
  } catch {
    return null;
  }
};

export const setCache = async (key, value, ttl = 1000 * 60 * 10) => {
  try {
    await keyv.set(key, value, ttl);
  } catch (err) {
    console.warn("Cache save failed:", err.message);
  }
};
