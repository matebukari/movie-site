// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import titlesRouter from "./routes/titles.js"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/titles", titlesRouter);

app.get("/", (req, res) => {
  res.send("Movie site API is running 🚀");
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
