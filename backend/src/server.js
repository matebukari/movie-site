import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import titlesRouter from "./routes/titles.js";
import utilsRouter from "./routes/utils.js";
import compression from "compression";
import { fetchShowsByCountry } from "./services/fetchers/byCountry.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://stream-scope.netlify.app",
    ],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json());

// Routes
app.use("/api/utils", utilsRouter);
app.use("/api/titles", titlesRouter);

app.get("/", (req, res) => {
  res.send("Movie site API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Warm cache
(async () => {
  try {
    await fetchShowsByCountry("us", 20, 1);
  } catch (e) {
    console.warn("⚠️ Cache warm failed:", e.message);
  }
})();
