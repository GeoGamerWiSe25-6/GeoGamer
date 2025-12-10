import Map from "https://js.arcgis.com/4.34/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.34/@arcgis/core/views/MapView.js";

const map = new Map({
    basemap:"satellite"
});

const view = new MapView({
    container:"map",
    map: map,
    center: [8.79, 53.075],
    zoom: 20
});

function getRandomLocationGermany(){
    const minLon = 5.9;
    const maxLon = 15.0;
    const minLat = 47.2;
    const maxLat = 55.1;

    const lon = minLon + Math.random() * (maxLon-minLon);
    const lat = minLat+ Math.random() * (maxLat -minLat);

    return [lat,lon];
}

async function hasBuildingNearby(lat, lon, radius=200) {
    const query = `
    [out:json][timeout:10];
    (
    way["building"](around:${radius}, ${lat}, ${lon});
    relation["building"](around:${radius}, ${lat}, ${lon});
    );
    out center;
    `;

    const url = "https://overpass-api.de/api/interpreter";

    try {
        const response = await fetch(url, {
            method: "POST",
            body: query,
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("json")) {
            console.error("Overpass hat kein JSON zurückgegeben", await response.text());
            return false;
        }

        const data = await response.json();
        // ob was gefunden wurde
        return data.elements && data.elements.length > 0;
    } catch (e) {
        console.error("Overpass error: ", e)
        return false;
    }
}

async function getPlausibleLocationGermany(maxAttempts=20){
    for (let attempt=1; attempt<= maxAttempts; attempt++){
        const [lat, lon] = getRandomLocationGermany();
        const ok = await hasBuildingNearby(lat, lon);

        if(ok) {
            console.log(`Passende Koordinate ${lat}, ${lon} nach ${attempt}.ten Versuch. `);
            return {lat, lon};
        }
    }
    console.warn("Keine geeigneten Koordinaten gefunden");
    return { lat:8.79, lon:53.075}; // Bremen als Fallback
}

async function jumpToRandomLocation(){
    const loc = await getPlausibleLocationGermany();

    view.goTo({
        center: [loc.lon, loc.lat],
        zoom: 16
    });
}

view.when(() => {
   jumpToRandomLocation();
});