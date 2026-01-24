export function getRandomLocationGermanyBBox() {
  const minLon = 5.9;
  const maxLon = 15.0;
  const minLat = 47.2;
  const maxLat = 55.1;

  const lon = minLon + Math.random() * (maxLon - minLon);
  const lat = minLat + Math.random() * (maxLat - minLat);

  return { lat, lon };
}
