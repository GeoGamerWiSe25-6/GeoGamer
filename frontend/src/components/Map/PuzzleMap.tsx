import { useEffect, useState } from "react";
import {
  MapContainer,
  LayersControl,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
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
    console.log("🔄 Switching to layer:", activeLayer);
    map.eachLayer((layer) => {
      const attr = (layer as any).options?.attribution || "";

      if (attr.includes("MapTiler")) {
        if (activeLayer !== "satellite") map.removeLayer(layer);
      } else if (attr.includes("BKG")) {
        if (activeLayer !== "topo") map.removeLayer(layer);
      } else if (attr.includes("OpenStreetMap contributors")) {
        if (activeLayer !== "osm") map.removeLayer(layer);
      }
    });
  }, [map, activeLayer]);

  return null;
}

// Trackt Zoom-Änderungen und meldet Einzoomen an ScoreContext
function ZoomTracker({ onZoomIn }: { onZoomIn: (zoomLevel: number) => void }) {
  useMapEvents({
    zoomend(e) {
      const currentZoom = e.target.getZoom();
      onZoomIn(currentZoom);
    },
  });
  return null;
}

// Sperrt/Entsperrt Zoom reaktiv basierend auf Score
function ZoomLockController({ locked }: { locked: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (locked) {
      map.scrollWheelZoom.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    } else {
      map.scrollWheelZoom.enable();
      map.touchZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [locked, map]);

  return null;
}

// Verhindert Rauszoomen
function MinZoomEnforcer({ minZoom }: { minZoom: number }) {
  const map = useMap();

  useMapEvents({
    zoomend() {
      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom, { animate: true });
      }
    },
  });

  return null;
}

interface PuzzleMapProps {
  view: MapView | null;
  roundReset?: number;
}

export function PuzzleMap({ view, roundReset }: PuzzleMapProps) {
  const maptilerKey = import.meta.env.VITE_MAPTILER_KEY || "";

  const {
    score,
    unlockedLayers,
    deductPoints,
    unlockLayer,
    registerZoomIn,
    zoomPenalty,
  } = useScore();

  const zoomLocked = score <= 0;

  const [showUnlockDialog, setShowUnlockDialog] = useState<
    "topo" | "osm" | null
  >(null);

  const [activeLayer, setActiveLayer] = useState<"satellite" | "topo" | "osm">(
    "satellite",
  );

  const [showPenaltyToast, setShowPenaltyToast] = useState(false);

  // Bei jeder neuen Runde: wieder Satellite als aktiven Layer
  useEffect(() => {
    setActiveLayer("satellite");
  }, [roundReset]);

  useEffect(() => {
    if (!unlockedLayers.topo && !unlockedLayers.osm) {
      setActiveLayer("satellite");
    }
  }, [unlockedLayers.topo, unlockedLayers.osm]);

  const handleZoomIn = (zoomLevel: number) => {
    if (zoomLevel < 3) return;
    registerZoomIn(zoomLevel);
    setShowPenaltyToast(true);
    setTimeout(() => setShowPenaltyToast(false), 1500);
  };

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

  return (
    <>
      <div className="puzzle-map-container">
        <MapContainer
          key={`map-${roundReset}`}
          center={[51.1657, 10.4515]}
          zoom={6}
          minZoom={10}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
          doubleClickZoom={false}
        >
          <LayersControl position="topleft">
            {/* Satellit */}
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
          <ZoomLockController locked={zoomLocked} />
          <MinZoomEnforcer minZoom={10} />
          {!zoomLocked && <ZoomTracker onZoomIn={handleZoomIn} />}

          {view?.center[0] && view?.center[1] && (
            <Marker
              position={[view.center[0], view.center[1]]}
              icon={actualIcon}
            />
          )}
        </MapContainer>

        {/* Zoom gesperrt Banner */}
        {zoomLocked && (
          <div className="zoom-locked-banner">
            🔒 Kein Zoom mehr — du hast keine Punkte!
          </div>
        )}

        {/* Zoom-Penalty Toast */}
        {showPenaltyToast && (
          <div className="zoom-penalty-toast">
            🔍 Eingezoomt — <strong>-{zoomPenalty} Punkte</strong>
          </div>
        )}

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
