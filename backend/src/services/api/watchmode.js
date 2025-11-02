import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = "https://api.watchmode.com/v1";

export const getWatchmodeTitleDetails = (id) =>
  axios.get(`${BASE_URL}/title/${id}/details/`, {
    params: { apiKey: WATCHMODE_API_KEY },
  });

export const getWatchmodeList = (params) =>
  axios.get(`${BASE_URL}/list-titles/`, {
    params: { apiKey: WATCHMODE_API_KEY, ...params },
  });

export const getWatchmodeSearch = (params) =>
  axios.get(`${BASE_URL}/search/`, {
    params: { apiKey: WATCHMODE_API_KEY, ...params },
  });

export const getWatchmodeReleases = (params) =>
  axios.get(`${BASE_URL}/releases/`, {
    params: { apiKey: WATCHMODE_API_KEY, ...params },
  });

export const getWatchmodeSources = (id, regions) =>
  axios.get(`${BASE_URL}/title/${id}/sources/`, {
    params: { apiKey: WATCHMODE_API_KEY, regions },
  });
