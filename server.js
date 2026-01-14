import express from "express";
import fs from "fs";
import crypto from "crypto";
import haversine from "haversine-distance";

const app = express();
app.use(express.json());

const locations = JSON.parse(
    fs.readFileSync("data/export_german_cities_towns.geojson")
);

const rounds = {};

app.get("/api/new-round", (req, res) =>{
    const feature = locations.features[ Math.floor(Math.random() * locations.features.length) ];

    const [lon, lat] = feature.geometry.coordinates;
    const roundId = crypto.randomUUID();
    rounds[roundId] = {lat, lon};

    res.json({
        "roundId" :roundId,
        "view": {
            "center": [lat, lon],
            "zoom": 16
        }
    });
});

app.post("/api/guess",(req,res) => {
    const { roundId, guessLat, guessLon} = req.body;
    const solution = rounds[roundId];

    if(!solution){
        return res.status(400).json({error: "Invalid round"});
    }

    const distance = haversine(
        [guessLat, guessLon],
        [solution.lat, solution.lon]
    );

    res.json({
       distance_km: distance,
       solution
    });

    delete rounds[roundId];

});

app.listen(3000);
