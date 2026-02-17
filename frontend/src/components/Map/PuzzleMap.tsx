import { useEffect } from "react";
import { MapContainer, TileLayer, LayersControl, useMap } from "react-leaflet";

const { BaseLayer } = LayersControl;

// Props
interface MapView {
  center: [number, number];
  zoom: number;
}

interface FlyToProps {
  view: MapView | null;
}

function FlyTo({ view }: FlyToProps) {
  const map = useMap();

  useEffect(() => {
    if (!view) return;
    console.log("🎯 GOAL POSITION (Puzzle):", {
      lat: view.center[0],
      lng: view.center[1],
      zoom: view.zoom,
    });

    map.setView(view.center, view.zoom);
  }, [view, map]);

  return null;
}

interface PuzzleMapProps {
  view: MapView | null;
}

export function PuzzleMap({ view }: PuzzleMapProps) {
  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || "";

  return (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      doubleClickZoom={false}
    >
      <LayersControl position="topleft">
        {/*In Endversion Standard (Api key Aufrufe sparen) Nur anzeigen wenn API-Key vorhanden */}
        {maptilerKey && (
          <BaseLayer checked name="Satellite">
            <TileLayer
              url={`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${maptilerKey}`}
              attribution="© MapTiler © OpenStreetMap contributors"
              maxZoom={20}
            />
          </BaseLayer>
        )}

        <BaseLayer name="Topographisch">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="© OpenStreetMap © CARTO"
            maxZoom={19}
          />
        </BaseLayer>

        <BaseLayer name="OSM">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
            maxZoom={19}
          />
        </BaseLayer>
      </LayersControl>

      <FlyTo view={view} />
    </MapContainer>
  );
}
