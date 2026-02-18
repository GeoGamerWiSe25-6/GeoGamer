import { useEffect } from "react";
import {MapContainer, TileLayer, LayersControl, useMap, Marker} from "react-leaflet";
import { useScore } from "../../context/ScoreContext";

import "./PuzzleMap.css";
import L from "leaflet";

const { BaseLayer } = LayersControl;

const actualIcon = new L.Icon({
  iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

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
  const { unlockedLayers } = useScore();

  return (
    <MapContainer
      center={[51.1657, 10.4515]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
      doubleClickZoom={false}
    >
      <LayersControl position="topleft">
        {/*In Endversion Standard (Api key Aufrufe sparen) Nur anzeigen wenn API-Key vorhanden */}
        {maptilerKey && (
          <BaseLayer checked name=" 🛰️Satellite">
            <TileLayer
              url={`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${maptilerKey}`}
              attribution="© MapTiler © OpenStreetMap contributors"
              maxZoom={20}
            />
          </BaseLayer>
        )}

        {/* Topo - Nur wenn freigeschaltet */}
        {unlockedLayers.topo ? (
          <BaseLayer name="🗻 Topographie">
            <TileLayer
              url="https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png"
              attribution="© OpenStreetMap © CARTO"
              maxZoom={18}
            />
          </BaseLayer>
        ) : (
          <BaseLayer name="🔒 Topographie (gesperrt)">
            <TileLayer
              url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              attribution="🔒 Locked"
            />
          </BaseLayer>
        )}

        {unlockedLayers.osm ? (
          <BaseLayer name="🗺️ OSM">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
              maxZoom={19}
            />
          </BaseLayer>
        ) : (
          <BaseLayer name="🔒 OSM (gesperrt)">
            <TileLayer
              url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              attribution="🔒 Locked"
            />
          </BaseLayer>
        )}
      </LayersControl>
      {view?.center[0] && view?.center[1] && (
          <Marker
              position={[view?.center[0], view?.center[1]]}
              icon={actualIcon}
          />
      )}
      <FlyTo view={view} />
    </MapContainer>
  );
}
