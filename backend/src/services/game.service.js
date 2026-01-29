import {pool} from "../config/db.js"
import {scoreMap, distanceMap} from "../utils/geo.utils.js"

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
       SELECT ST_PointOnSurface(geom) 
       AS point
       FROM communities_clean
       WHERE id= $1
       `, [communityId]);

        const point25832 = p.rows[0].point;

        const round = await client.query(`
       INSERT INTO rounds (target_community_id, target_point)
       VALUES ($1, $2)
       RETURNING id
       `, [communityId, point25832]);

        const roundId = round.rows[0].id;

        // Für Leaflet FE auf ESPG 4326 umwandeln
        let point4326 = await client.query(`
            SELECT ST_AsGeoJSON(
                ST_TRANSFORM($1::geometry, 4326)
            ) AS point
        `,[point25832]);

        point4326 = JSON.parse(point4326.rows[0].point)
        const [lon, lat] = point4326.coordinates;
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
        WHERE ST_Contains(g.geom,
                          ST_Transform( ST_SetSRID(ST_Point($1, $2), 4326),
                                        25832)
              )
    `, [guessLon, guessLat]);

    if(guessedCommunityResult.rows.length===0){
        throw new Error("Guess outside all communities");
    }

    const guessedCommunityId = guessedCommunityResult.rows[0].id;

    const result = await pool.query(`
        SELECT * FROM distance_classes WHERE round_id=$1 AND community_id=$2
    `, [roundId, guessedCommunityId]);

    const distanceClass = result.rows[0].distance_class;
    const distanceClassName = distanceMap[distanceClass];

    return {
                distanceClass,
                score: scoreMap[distanceClass],
                distanceClassName,
                community: result.rows[0].name
    };
}

