import express from "express";
import cors from "cors";
import {pool} from "./data/db.js"

const app = express();
app.use(express.json());
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


app.get("/api/start", async (req, res) => {
   const client  = await pool.connect();

   try{
       // zufällige Gemeinde
       const community = await client.query(`
       SELECT id, geom
       FROM communities_clean
       ORDER BY random()
       LIMIT 1
       `);

       const communityId = community.rows[0].id;

       // zufälliger Punkt in Gemeinde
       const p = await client.query(`
       SELECT ST_AsGeoJSON( ST_PointOnSurface(geom) ) 
       AS point
       FROM communities_clean
       WHERE id= $1
       `, [communityId]);

       const point = JSON.parse(p.rows[0].point);
       const [lon, lat] = point.coordinates;

       const round = await client.query(`
       INSERT INTO rounds (target_community_id, target_point)
       VALUES ($1, ST_SetSRID(ST_Point($2, $3), 25832))
       RETURNING id
       `, [communityId, lon, lat]);

       const roundId = round.rows[0].id;

       res.json({
           roundId: roundId,
           view: {
               center: [lat, lon],
               zoom: 16
           }
       });
   } finally {
       client.release();
   }
});

app.post("/api/guess",async (req,res) => {
    const {roundId, guessLat, guessLon} = req.body;
    const guessedCommunityResult = await pool.query(`
        SELECT id
        FROM communities_clean g
        WHERE ST_Contains(g.geom, ST_SetSRID(ST_Point($1, $2), 25832))
    `, [guessLon, guessLat]);

    const guessedCommunityId = guessedCommunityResult.rows[0].id;

    const result = await pool.query(`
        SELECT * FROM distance_classes WHERE round_id=$1 AND community_id=$2
    `, [roundId, guessedCommunityId]);

    const distanceClass = result.rows[0].distance_class;

    const scoreMap ={
        0: 1000,
        1: 750,
        2: 400,
        3: 100,
        4: 0
    };

    res.json({
        distanceClass,
        score: scoreMap[distanceClass],
        community: result.rows[0].name
    });
});

app.listen(3000);
