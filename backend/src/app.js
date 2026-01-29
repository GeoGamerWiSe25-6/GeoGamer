import express from "express";
import cors from "cors";
import corsOptions from "./config/cors.js"
import gameRoutes from "./routes/game.routes.js"

const app = express();
app.use(express.json());

app.use(cors(corsOptions));

app.use("/api", gameRoutes)

app.listen(3000);
