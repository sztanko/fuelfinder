import { StationRow } from "./StationRow";

const StationList = (props) => {
  const { userLocation, stations, lastUpdate } = props;
  const updateMinutesAgo = Math.ceil(
    (new Date().getTime() / 1000 - lastUpdate) / 60
  );
  const stationElemennts = stations.map((station) => (
    <StationRow
      key={station.id}
      station={station}
      userLocation={userLocation}
    />
  ));
  return (
    <div className="stationList">
      <div>Last update: {updateMinutesAgo} minutes ago</div>
      {stationElemennts}
    </div>
  );
};

export { StationList };
