import {pool} from "../config/db.js"
import {scoreMap} from "../utils/geo.utils.js"

export async function startRound(){
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

        return {
                        roundId: roundId,
                        view: {
                            center: [lat, lon],
                            zoom: 16
                        }
                    };
    } finally {
        client.release();
    }
}


export async function guessCommunity(roundId, guessLat, guessLon){
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

    return {
                distanceClass,
                score: scoreMap[distanceClass],
                community: result.rows[0].name
    };
}

