// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import titlesRouter from "./src/routes/titles.js"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes

app.get("/", (req, res) => {
  res.send("Catalogue API is running 🚀");
});

app.use("/api/titles", titlesRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
