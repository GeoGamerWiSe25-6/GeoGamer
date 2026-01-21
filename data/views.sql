-- View bestehend aus den wichtigen Daten
CREATE OR REPLACE VIEW communities_clean AS
SELECT id, geom,
       "GEN" AS name,
       "BEZ" AS type,
       "EWZ" AS population,
       "KFL" AS area_km2
FROM gemeinden;

CREATE TABLE rounds(
    id SERIAL PRIMARY KEY,
    target_community_id INTEGER NOT NULL,
    target_point geometry(Point, 25832),
    start TIMESTAMP DEFAULT now()
);

-- Distanzklassen View
CREATE OR REPLACE VIEW v_distance_classes AS
SELECT r.id AS round_id,
       g.id AS community_id,
       g.name,
       g.population,

       CASE
           WHEN g.id = r.target_community_id THEN 0
           WHEN ST_Touches(g.geom, t.geom) THEN 1
           WHEN ST_Distance(g.geom, t.geom) <= 20000 THEN 2
           WHEN ST_Distance(g.geom, t.geom) <= 50000 THEN 3
           ELSE 4
           END AS distance_class,
       g.geom
FROM  rounds r
          JOIN gemeinden_clean t ON t.id = r.target_community_id
          JOIN gemeinden_clean g ON TRUE;