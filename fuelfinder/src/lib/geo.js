import { useState, useEffect } from "react";

const RADIUS_OF_EARTH_IN_KM = 6371;
// const X_RANGE = 0.2;
// const y_RANGE = 0.2;

/**
 * Calculates the haversine distance between point A, and B.
 * @param {number[]} latlngA [lng, lat] point A
 * @param {number[]} latlngB [lng, lat] point B
 * @param {boolean} isMiles If we are using miles, else km.
 */
const haversineDistance = ([lon1, lat1], [lon2, lat2], isMiles = true) => {
  const toRadian = (angle) => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  // Haversine Formula
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  let finalDistance = RADIUS_OF_EARTH_IN_KM * c;

  if (isMiles) {
    finalDistance /= 1.60934;
  }

  return finalDistance;
};

const findNearestStations = (lonlat, stations, maxDistance) => {
  const out = stations.filter(
    (station) => haversineDistance(lonlat, station.coords) < maxDistance
  );

  return out.sort(
    (s1, s2) =>
      haversineDistance(lonlat, s1.coords) -
      haversineDistance(lonlat, s2.coords)
  );
};

export const usePosition = () => {
  const [position, setPosition] = useState({});
  const [error, setError] = useState(null);

  const onChange = ({ coords }) => {
    setPosition({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };
  const onError = (error) => {
    setError(error.message);
  };
  useEffect(() => {
    const geo = navigator.geolocation;
    if (!geo) {
      setError("Geolocation is not supported");
      return;
    }
    const watcher = geo.watchPosition(onChange, onError);
    return () => geo.clearWatch(watcher);
  }, []);
  return { ...position, error };
};

export { haversineDistance, findNearestStations };
