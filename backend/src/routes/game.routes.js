import express from "express";
import {startRound, guessCommunity} from "../services/game.service.js"

const router = express.Router();

router.get("/start", async (req, res) => {
    try {
        const result = await startRound();
        res.json(result);
    } catch(err) {
        console.error(err);
        res.status(500).json({error: "Failed to start round."});
    }
});

router.post("/guess",async (req,res) => {
    try{
        const {roundId, guessLat, guessLon} = req.body;
        const result = await guessCommunity(roundId, guessLat, guessLon);
        res.json(result);
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Failed to evaluate guess."});
    }
});

export default router;
