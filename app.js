import Map from "https://js.arcgis.com/4.34/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.34/@arcgis/core/views/MapView.js";
import OpenStreetMapLayer from "https://js.arcgis.com/4.34/@arcgis/core/layers/OpenStreetMapLayer.js"

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

async function loadLocations(){
    await view.when();
    const response = await fetch("data/export_german_cities_towns.geojson");
    const data = await response.json();
    const features = data.features;
    const randomFeature = features[Math.floor(Math.random()*features.length)];

    const lat = randomFeature.geometry.coordinates[1];
    const lon = randomFeature.geometry.coordinates[0];
    console.log("Zufälliger Ort: ", randomFeature.properties.name);

    view.goTo({
        center : [lon, lat],
        zoom: 16
    });
}

loadLocations();


const osmLayer = new OpenStreetMapLayer({
    id: "osmLayer"
});
map.add(osmLayer);

document.getElementById('osmBtn').addEventListener('click', () => {
    map.findLayerById("osmLayer").visible = !map.findLayerById("osmLayer").visible;
});