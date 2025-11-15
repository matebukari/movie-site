import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import titlesRouter from "./routes/titles.js"
import utilsRouter from "./routes/utils.js"
import compression from "compression";
import { fetchShowsByCountry } from "./services/fetchers/byCountry.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(compression());
app.use(cors());
app.use(express.json());
app.use("/api/utils", utilsRouter);

// Routes
app.use("/api/titles", titlesRouter);

app.get("/", (req, res) => {
  res.send("Movie site API is running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});

(async () => {
  try {
    await fetchShowsByCountry("us", 20, 1);
  } catch (e) {
    console.warn("⚠️ Cache warm failed:", e.message);
  }
})();
