import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useRef } from "react";

const guessIcon = new L.Icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const actualIcon = new L.Icon({
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export type Guess = { lat: number; lon: number };

interface Result {
  actualLocation: { lat: number; lon: number };
  distanceClass: number;
  score: number;
  distanceClassName: string;
  community: string;
}

function ClickHandler({
  guess,
  onChange,
  disabled,
}: {
  guess: Guess | null;
  onChange: (g: Guess) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        // --- LOGGING GUESS POSITION ---
        console.log("📍 YOUR GUESS (Clicked):", {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });

        onChange({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
  });

  return guess ? (
    <Marker
      position={[guess.lat, guess.lon] as LatLngExpression}
      icon={guessIcon}
    />
  ) : null;
}

function FlyToResult({
  target,
}: {
  target?: { lat: number; lon: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;

    console.log("FlyToResult target changed:", target);
    map.setView([target.lat-0.08, target.lon], 10, { animate: true });
  }, [map, target?.lat, target?.lon]);

  return null;
}

function DistanceLayerController({
  roundId,
  active,
}: {
  roundId?: number | null;
  active: boolean;
}) {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!active || !roundId) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }
    console.log("round id = ", roundId);
    const wmslayer = L.tileLayer.wms(
      "http://localhost:8080/geoserver/geogamer/wms",
      {
        layers: "geogamer:distance_classes",
        format: "image/png",
        transparent: true,
        version: "1.1.1",
        CQL_FILTER: `round_id=${roundId}`,
      } as any,
    );

    wmslayer.addTo(map);
    layerRef.current = wmslayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, roundId, active]);

  return null;
}

export function GuessMap({
  guess,
  onChange,
  result,
  roundId,
}: {
  guess: Guess | null;
  onChange: (g: Guess) => void;
  result?: Result | null;
  roundId?: number | null;
}) {
  console.log("GuessMap render, result:", result);

  return (
    <MapContainer
      center={[51.1657, 10.4515] as LatLngExpression}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <ClickHandler guess={guess} onChange={onChange} disabled={!!result} />
      <DistanceLayerController roundId={roundId} active={!!result} />
      {result && (
        <FlyToResult
          target={
            result
              ? {
                  lat: result.actualLocation.lat,
                  lon: result.actualLocation.lon,
                }
              : null
          }
        />
      )}

      {result && (
        <Marker
          position={[result.actualLocation.lat, result.actualLocation.lon]}
          icon={actualIcon}
        />
      )}
      {/* Marker für Guess */}
      {guess && <Marker position={[guess.lat, guess.lon]} icon={guessIcon} />}
      {/* Marker für tatsächliche Position */}
      {result?.actualLocation && (
        <Marker
          position={[result.actualLocation.lat, result.actualLocation.lon]}
          icon={actualIcon}
        />
      )}
      {/* Linie zwischen Guess und tatsächlicher Position */}
      {guess && result?.actualLocation && (
        <Polyline
          positions={[
            [guess.lat, guess.lon],
            [result.actualLocation.lat, result.actualLocation.lon],
          ]}
          color="#e74c3c"
          weight={3}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  );
}
