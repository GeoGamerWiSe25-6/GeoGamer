import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

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
  distanceKm: number;
  distanceClass: string;
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

export function GuessMap({
  guess,
  onChange,
  result,
}: {
  guess: Guess | null;
  onChange: (g: Guess) => void;
  result?: Result | null;
}) {
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

      {/* Actual Location nach Guess */}
      {result && result.actualLocation && (
        <>
          <Marker
            position={[result.actualLocation.lat, result.actualLocation.lon]}
            icon={actualIcon}
          />

          {guess && (
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
        </>
      )}
    </MapContainer>
  );
}
