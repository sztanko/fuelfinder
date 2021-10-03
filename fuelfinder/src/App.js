import { useState, useEffect } from "react";
import { loadStations } from "./lib/data";
import { usePosition, findNearestStations } from "./lib/geo";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { StationList } from "./components/StationList";

const RADIUS = 8;

function App() {
  const [stations, setStations] = useState(null);
  const [nearestStations, setNearestStations] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const { latitude, longitude, error } = usePosition();
  useEffect(() => {
    loadStations((result) => setStations(result.data), setLoadError);
  }, []);

  useEffect(() => {
    setNearestStations(
      stations && latitude && longitude
        ? {
            lastUpdate: stations.last_update,
            stationData: findNearestStations(
              [longitude, latitude],
              stations.station_data,
              RADIUS
            ),
          }
        : null
    );
  }, [stations, latitude, longitude]);

  var content = null;
  if (!stations) {
    if (loadError) {
      content = <Alert>Coulnd't load stations. Error happened.</Alert>;
    } else content = <Alert>Loading stations...</Alert>;
  }
  if (!latitude) {
    if (error) {
      content = <Alert>Coulnd't get your location.</Alert>;
    }
    content = <Alert>Getting your location</Alert>;
  }

  if (!content && nearestStations) {
    content = (
      <StationList
        userLocation={[longitude, latitude]}
        stations={nearestStations.stationData}
        lastUpdate={stations.last_update}
      />
    );
  }
  return (
    <Container>
      <Row>
        <Col>
          <h1>FuelFinder.uk</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Nearest Stations</h2>
          {content}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
