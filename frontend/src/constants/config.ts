export const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:3000";
export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY || "";

export const MAP_CONFIG = {
  defaultCenter: [51.1657, 10.4515] as [number, number],
  defaultZoom: 6,
  maxZoom: 19,
};

export const UNLOCK_COSTS = {
  topo: 100,
  osm: 200,
};

export const INITIAL_SCORE = 1000;

// export const DISTANCE_CLASSES = {
//   perfect: { min: 0, max: 1, color: "#00ff00" },
//   excellent: { min: 1, max: 5, color: "#7fff00" },
//   very_good: { min: 5, max: 25, color: "#ffff00" },
//   good: { min: 25, max: 100, color: "#ffa500" },
//   mediocre: { min: 100, max: 250, color: "#ff6600" },
//   poor: { min: 250, max: Infinity, color: "#ff0000" },
// };
