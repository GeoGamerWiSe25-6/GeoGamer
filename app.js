const map = L.map("map").setView([51.575, 8.79], 6);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "© OpenStreetMap contributors"
    }
).addTo(map);

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
    //await view.when();
    const response = await fetch("data/export_german_cities_towns.geojson");
    const data = await response.json();
    const features = data.features;
    const randomFeature = features[Math.floor(Math.random()*features.length)];

    const lat = randomFeature.geometry.coordinates[1];
    const lon = randomFeature.geometry.coordinates[0];
    console.log("Zufälliger Ort: ", randomFeature.properties.name);
    // TODO jump to location

}

loadLocations();


const buttons = document.querySelectorAll("#mapview-control button");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const mapview = btn.dataset.mapview;
        //TODO change view


    })
})