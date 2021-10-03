import axios from "axios";
const STATIONS_URL = "stations.json";
const SAVE_URL = process.env.REACT_APP_SAVE_API_URL;
const loadStations = (callback, errorCallback) => {
  const url = `${STATIONS_URL}?t=${new Date().getTime()}`;
  axios.get(url).then(callback).catch(errorCallback);
};

const saveStation = (data, callback) => {
  axios.post(SAVE_URL, data).then(callback);
};

export { loadStations, saveStation };
