# GeoGamer

Projekt für das Modul Geodatenverarbeitung WiSe 25/26

## Overpass Query für Orte in Deutschland (https://overpass-turbo.eu/)

[out:json];
area["ISO3166-1"="DE"]->.de;
(
node["place"~"city|town"](area.de);
way["place"~"city|town"](area.de);
relation["place"~"city|town"](area.de);
);
out center;

Das Ergebnis ist gespeichert in data/export_german_cities_towns.geojson

## Vite React Projekt erstellen

npm create vite@latest . -- --template react
npm install

## Packages für Leaflet

npm install leaflet react-leaflet

## FE Starten

cd frontend/
npm run dev
