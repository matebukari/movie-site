import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = "https://api.watchmode.com/v1";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
});

const handleRequest = async (url, params = {}) => {
  try {
    const response = await api.get(url, {
      params: { apiKey: WATCHMODE_API_KEY, ...params },
    });

    return response;
  } catch (err) {
    console.error(
      "❌ Watchmode API error:",
      err.response?.data || err.message
    );
    throw new Error(
      `Watchmode request failed: ${err.response?.status || "?"} ${
        err.response?.statusText || ""
      }`
    );
  }
};


export const getWatchmodeTitleDetails = (id) => handleRequest(`/title/${id}/details/`);

export const getWatchmodeList = (params) => handleRequest(`/list-titles/`, params);

export const getWatchmodeSearch = (params) => handleRequest(`/search/`, params);

export const getWatchmodeReleases = (params) => handleRequest(`/releases/`, params);

export const getWatchmodeSources = (id, regions) => handleRequest(`/title/${id}/sources/`, { regions });
