import express from "express";
import cors from "cors";
import corsOptions from "./config/cors.js";
import gameRoutes from "./routes/game.routes.js";

const app = express();
app.use(express.json());

app.use(cors(corsOptions));

app.use("/api", gameRoutes);

app.get("/", (req, res) => {
  res.send("Backend API is running. Use /api/start to begin.");
});
app.listen(3000);
