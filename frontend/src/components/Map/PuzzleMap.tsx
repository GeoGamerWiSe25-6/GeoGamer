import { useEffect, useState } from "react";
import {
  LayersControl,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useScore } from "../../context/ScoreContext";
import { UnlockDialog } from "../Game/UnlockDialog";
import { UNLOCK_COSTS } from "../../constants/config";
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

function FlyTo({ view }: { view: MapView | null }) {
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

function LayerSwitcher({
  activeLayer,
}: {
  activeLayer: "satellite" | "topo" | "osm";
}) {
  const map = useMap();

  useEffect(() => {
    // Leaflet's Layer Control triggern
    //const layersControl = (map as any)._layers;

    console.log("🔄 Switching to layer:", activeLayer);

    // Layer Control neu rendern erzwingen
    map.eachLayer((layer) => {
      const attr = (layer as any).options?.attribution || "";

      if (attr.includes("MapTiler")) {
        // Satellite
        if (activeLayer !== "satellite") {
          map.removeLayer(layer);
        }
      } else if (attr.includes("BKG")) {
        // Topo
        if (activeLayer !== "topo") {
          map.removeLayer(layer);
        }
      } else if (attr.includes("OpenStreetMap contributors")) {
        // Reines OSM (ohne MapTiler)
        if (activeLayer !== "osm") {
          map.removeLayer(layer);
        }
      }
    });
  }, [map, activeLayer]);

  return null;
}

interface PuzzleMapProps {
  view: MapView | null;
  roundReset?: number;
}

export function PuzzleMap({ view, roundReset }: PuzzleMapProps) {
  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || "";

  const { score, unlockedLayers, deductPoints, unlockLayer } = useScore();

  const [showUnlockDialog, setShowUnlockDialog] = useState<
    "topo" | "osm" | null
  >(null);

  const [activeLayer, setActiveLayer] = useState<"satellite" | "topo" | "osm">(
    "satellite",
  );

  const handleUnlockClick = (layer: "topo" | "osm") => {
    if (layer === "osm" && !unlockedLayers.topo) {
      alert("⚠️ Du musst zuerst die Topographie-Karte freischalten!");
      return;
    }
    setShowUnlockDialog(layer);
  };

  const handleConfirmUnlock = () => {
    if (!showUnlockDialog) return;

    const cost = UNLOCK_COSTS[showUnlockDialog];
    const success = deductPoints(cost);

    if (success) {
      unlockLayer(showUnlockDialog);
      setActiveLayer(showUnlockDialog);
      setShowUnlockDialog(null);
    }
  };

  useEffect(() => {
    // Bei jeder neuen Runde: wieder Satellite als aktiven Layer
    setActiveLayer("satellite");
  }, [roundReset]);

  return (
    <>
      <div className="puzzle-map-container">
        <MapContainer
          key={`map-${roundReset}`}
          center={[51.1657, 10.4515]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          doubleClickZoom={false}
        >
          <LayersControl position="topleft">
            {/* Satellit - IMMER verfügbar */}
            <BaseLayer
              checked={activeLayer === "satellite"}
              name="🛰️ Satellite"
            >
              <TileLayer
                url={`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${maptilerKey}`}
                attribution="© MapTiler © OpenStreetMap contributors"
                maxZoom={20}
              />
            </BaseLayer>

            {/* Topo - Nur wenn freigeschaltet */}
            {unlockedLayers.topo && (
              <BaseLayer checked={activeLayer === "topo"} name="🗻 Topographie">
                <TileLayer
                  url="https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png"
                  attribution="© BKG"
                  maxZoom={18}
                />
              </BaseLayer>
            )}

            {/* OSM - Nur wenn freigeschaltet */}
            {unlockedLayers.osm && (
              <BaseLayer checked={activeLayer === "osm"} name="🗺️ OSM">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                  maxZoom={19}
                />
              </BaseLayer>
            )}
          </LayersControl>
          <FlyTo view={view} />
          <LayerSwitcher activeLayer={activeLayer} />
          {view?.center[0] && view?.center[1] && (
            <Marker
              position={[view?.center[0], view?.center[1]]}
              icon={actualIcon}
            />
          )}
        </MapContainer>

        {/* Unlock-Buttons */}
        <div className="unlock-buttons">
          {!unlockedLayers.topo && (
            <button
              className="unlock-button unlock-topo"
              onClick={() => handleUnlockClick("topo")}
              title={`Topographie freischalten (-${UNLOCK_COSTS.topo} Punkte)`}
            >
              <span className="unlock-icon">🔒</span>
              <span className="unlock-text">
                <div className="unlock-name">Topo</div>
                <div className="unlock-price">-{UNLOCK_COSTS.topo}</div>
              </span>
            </button>
          )}

          {!unlockedLayers.osm && (
            <button
              className="unlock-button unlock-osm"
              onClick={() => handleUnlockClick("osm")}
              disabled={!unlockedLayers.topo}
              title={
                unlockedLayers.topo
                  ? `OSM freischalten (-${UNLOCK_COSTS.osm} Punkte)`
                  : "Zuerst Topo freischalten!"
              }
            >
              <span className="unlock-icon">🔒</span>
              <span className="unlock-text">
                <div className="unlock-name">OSM</div>
                <div className="unlock-price">-{UNLOCK_COSTS.osm}</div>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Unlock-Dialog */}
      {showUnlockDialog && (
        <UnlockDialog
          layer={showUnlockDialog}
          currentScore={score}
          onConfirm={handleConfirmUnlock}
          onCancel={() => setShowUnlockDialog(null)}
        />
      )}
    </>
  );
}
