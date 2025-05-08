import React from "react";
import { Col, Row } from "react-bootstrap";
import {
  SiVisualstudiocode,
  SiPostman,
  SiSlack,
  SiVercel,
  SiWindows,
  SiVite
} from "react-icons/si";

function Toolstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <SiWindows />
        <span className="tooltip">Windows</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiVisualstudiocode />
        <span className="tooltip">VScode</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiPostman />
        <span className="tooltip">Postman</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiVercel /> <span className="tooltip">Versel</span>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiVite /> <span className="tooltip">Vite</span>
      </Col>
    </Row>
  );
}

export default Toolstack;
