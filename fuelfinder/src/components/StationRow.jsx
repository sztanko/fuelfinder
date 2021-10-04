import { Row, Col, Badge, Button } from "react-bootstrap";
import { useState } from "react";
import { haversineDistance } from "../lib/geo";
import { UpdateForm } from "./UpdateForm";

const TIME_THRESHOLD = (3 * 3600).toString();
const SMALL_TIME_THRESHOLD = (1800).toString();

/**
 * -1: confident there is no fuel
 * 0: not sure
 * 1: confident there is fuel
 * @param {*} mRecent
 * @param {*} mAll
 * @returns
 */
const getFuelConfidenceScore = (mRecent, mAll) => {
  const mRecent_total = mRecent.yes + mRecent.no;

  const mAll_total = mAll.yes + mAll.no;
  const mRecent_strength = 1 - 1 / Math.pow(3, mRecent_total);
  const mAll_strength = 1 - 1 / Math.pow(3, mAll_total);

  if (mAll_total === 0) return 0;
  return (
    0.3 *
      mRecent_strength *
      (mRecent_total > 0 ? (mRecent.yes - mRecent.no) / mRecent_total : 0) +
    0.7 *
      mAll_strength *
      (mAll_total > 0 ? (mAll.yes - mAll.no) / mAll_total : 0)
  );
};

const getLabelForConfidence = (confidence) => {
  const label = confidence < 0 ? "no" : "yes";
  if (Math.abs(confidence) < 0.1) return ["Don't know", "secondary"];
  if (Math.abs(confidence) < 0.4) return [`Not sure`, "warning"];
  if (Math.abs(confidence) < 0.7)
    return [`Probably ${label}`, confidence < 0 ? "danger" : "success"];
  return [label, confidence < 0 ? "danger" : "success"];
};

const StationRow = (props) => {
  const { id, coords, name, last_update, phone, addr, stats } = props.station;
  const [isFormVisible, setFormVisible] = useState(false);
  const distance = haversineDistance(coords, props.userLocation);
  const myGmapsLocation = [props.userLocation[1], props.userLocation[0]];
  const mapUrl = `https://www.google.com/maps/dir/${myGmapsLocation}/${coords[1]},${coords[0]}`;
  // console.log(stats);
  const dieselConfidence = getFuelConfidenceScore(
    stats[SMALL_TIME_THRESHOLD]["diesel"],
    stats[TIME_THRESHOLD]["diesel"]
  );
  const [dieselLabel, dieselVariant] = getLabelForConfidence(dieselConfidence);
  const petrolConfidence = getFuelConfidenceScore(
    stats[SMALL_TIME_THRESHOLD]["petrol"],
    stats[TIME_THRESHOLD]["petrol"]
  );
  const [petrolLabel, petrolVariant] = getLabelForConfidence(petrolConfidence);

  /*
  Possible states:
  - yes
  - no
  - maybe
  - information outdated
  
  */
  // console.log(last_update);
  const lastUpdate = Math.round(
    (new Date().getTime() / 1000 - last_update) / 60
  );
  return (
    <div className="station">
      <Row>
        <Col>
          <div className="stationName">{name || addr || "unnamed"}</div>
          {addr && <p>{addr}</p>}
          <small>
            {Math.ceil(distance * 100) / 100} miles away. (
            <a href={mapUrl}>Directions</a>)
          </small>
        </Col>
        <Col>
          <div className="stationInfo">
            Diesel:
            <Badge bg={dieselVariant}>{dieselLabel}</Badge>
            <br />
            Petrol:
            <Badge bg={petrolVariant}>{petrolLabel}</Badge>
            <br />
            <div className="lastUpdate">
              {lastUpdate < 5 * 60
                ? `last update ${lastUpdate}m ago`
                : "too long ago"}
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          {phone && (
            <Button size="sm" variant="info" href={`tel://${phone}`}>
              Call them: {phone}
            </Button>
          )}
        </Col>
        <Col>
          <Button
            size="sm"
            variant="warning"
            onClick={(e) => setFormVisible(!isFormVisible)}
          >
            {isFormVisible ? "Hide" : "Send Update"}
          </Button>
        </Col>
      </Row>
      {isFormVisible && <UpdateForm stationId={id} address={""} />}
    </div>
  );
};

export { StationRow };
