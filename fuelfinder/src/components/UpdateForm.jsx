import { useState } from "react";
import { Row, Form, Col, Alert, Button } from "react-bootstrap";
import { saveStation } from "../lib/data";
const UpdateForm = (props) => {
  const { stationId } = props;
  const [petrol, setPetrol] = useState(undefined);
  const [diesel, setDiesel] = useState(undefined);
  const [queue, setQueue] = useState(-5);
  const [msg, setMsg] = useState(null);
  if (msg) {
    return (
      <div className="submitForm">
        <Row>
          <Col>
            <Alert variant="success">
              Thank you for submitting this information. It will appear on the
              website within the next 10-15 minutes.
            </Alert>
          </Col>
        </Row>
      </div>
    );
  }
  return (
    <div className="submitForm">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          console.log(e);
          const data = {
            id: stationId,
            petrol,
            diesel,
            queue,
          };
          saveStation(data, () => {
            setMsg(true);
          });
        }}
      >
        <Form.Group as={Row} className="mb-3" controlId="formPetrol">
          <Form.Label column sm="4">
            Is there Petrol?
          </Form.Label>
          <Col sm="8">
            <Form.Check
              inline
              label="Yes"
              name="petrol"
              type="radio"
              id="petrol-check-yes"
              checked={petrol === true}
              onChange={(value) => setPetrol(true)}
            />
            <Form.Check
              inline
              label="No"
              name="petrol"
              type="radio"
              id="petrol-check-no"
              checked={petrol === false}
              onChange={(value) => setPetrol(false)}
            />
            <Form.Check
              inline
              label="Don't know"
              name="petrol"
              type="radio"
              id="petrol-check-dontknow"
              checked={petrol === undefined}
              onChange={(value) => setPetrol(undefined)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formDiesel">
          <Form.Label column sm="4">
            Is there Diesel?
          </Form.Label>
          <Col sm="8">
            <Form.Check
              inline
              label="Yes"
              name="diesel"
              type="radio"
              id="diesel-check-yes"
              checked={diesel === true}
              onChange={(value) => setDiesel(true)}
            />
            <Form.Check
              inline
              label="No"
              name="diesel"
              type="radio"
              id="diesel-check-no"
              checked={diesel === false}
              onChange={(value) => setDiesel(false)}
            />
            <Form.Check
              inline
              label="Don't know"
              name="diesel"
              type="radio"
              id="diesel-check-dontknow"
              checked={diesel === undefined}
              onChange={(value) => setDiesel(undefined)}
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formQueue">
          <Form.Label column sm="4">
            How long is the queue in minutes, your guess?
          </Form.Label>
          <Col sm="8">
            <Form.Range
              min="-5"
              max="120"
              value={queue}
              step={5}
              onChange={(event) => {
                setQueue(event.target.value);
              }}
            />
            {queue >= 0 ? `${queue} minute(s)` : "No idea"}
          </Col>
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </div>
  );
};

export { UpdateForm };
