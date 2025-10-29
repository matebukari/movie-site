// src/services/streamingAvailabilityService.js
import * as streamingAvailability from "streaming-availability";

const client = new streamingAvailability.Client(
  new streamingAvailability.Configuration({
    apiKey: process.env.RAPID_API_KEY
  })
);

export const fetchShowsByCountry = async (country) => {
  try {

    const data = await client.searchApi.searchShows({
      country,
      services,
      showType,
      orderBy: "popularity", // optional
      desc: true, // descending order
      limit: 50 // you can adjust this
    });

    return data.results || [];
  } catch (error) {
    console.error("Error fetching shows:", error.response?.data || error.message);
    throw new Error("Failed to fetch shows from Streaming Availability API");
  }
};
